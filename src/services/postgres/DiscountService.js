const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { searchName } = require("../../utils/searchName");
const { pagination, getMaxPage } = require("../../utils/pagination");
const calculatePercentageDiscount = require("../../utils/calculatePercentageDiscount");

class DiscountService {
  constructor() {
    this._pool = new Pool();
  }

  async getDiscounts({ code, page, limit }) {
    let query = `
      SELECT 
        d.id, d.discount_code, dt.type_name, d.description, d.start_date, d.end_date 
      FROM discount d 
      LEFT JOIN discount_type dt ON d.discount_type_id = dt.id
      WHERE d.deleted_at IS NULL
    `;

    query = await searchName(
      { keyword: code },
      "discount d",
      "d.discount_code",
      query
    );

    const p = pagination({ limit, page });
    const page_info = await getMaxPage(p, query);
    query += ` ORDER BY d.created_at DESC LIMIT ${p.limit} OFFSET ${p.offset}`;

    try {
      const result = await this._pool.query(query);
      return { data: result.rows, page_info };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getDiscountByID(id) {
    const query = {
      text: `
        SELECT 
          d.discount_code,
          dt.type_name AS discount_type,
          d.description,
          json_agg(json_build_object('product_id', p.id, 'product_name', p.product_name, 'discount_value', pd.discount_value)) AS products
        FROM discount d
        LEFT JOIN discount_type dt ON d.discount_type_id = dt.id
        LEFT JOIN product_discount pd ON d.id = pd.discount_id
        LEFT JOIN products p ON pd.product_id = p.id
        WHERE d.id = $1 AND d.deleted_at IS NULL
        GROUP BY 
          d.discount_code,
          dt.type_name,
          d.description;
      `,
      values: [id],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rows[0]) {
        throw new NotFoundError(
          "Discount not found, Discount with that ID does not exist"
        );
      }

      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addDiscount({
    discount_code,
    discount_type_id,
    start_date,
    end_date,
    products,
  }) {
    await this._validateDiscount(
      discount_code,
      discount_type_id,
      start_date,
      end_date,
      products
    );

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    startDate.setDate(startDate.getDate() + 1);
    endDate.setDate(endDate.getDate() + 1);

    const discountQuery = {
      text: `
        INSERT INTO discount (
          discount_code,
          discount_type_id,
          start_date,
          end_date
        ) VALUES ($1, $2, $3, $4) RETURNING *
      `,
      values: [discount_code, discount_type_id, startDate, endDate],
    };

    try {
      await this._pool.query("BEGIN");
      const newDiscount = await this._pool.query(discountQuery);
      await this._addProductDiscounts(newDiscount.rows[0].id, products);
      await this._pool.query("COMMIT");
      return newDiscount.rows[0];
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async editDiscount(
    discount_id,
    { discount_code, discount_type_id, start_date, end_date, products }
  ) {
    await this._validateDiscount(
      discount_code,
      discount_type_id,
      start_date,
      end_date,
      products,
      discount_id
    );

    const updateQuery = {
      text: `
        UPDATE discount SET
          discount_code = $1,
          discount_type_id = $2,
          start_date = $3,
          end_date = $4
        WHERE id = $5 AND deleted_at IS NULL
        RETURNING *
      `,
      values: [
        discount_code,
        discount_type_id,
        start_date,
        end_date,
        discount_id,
      ],
    };

    try {
      await this._pool.query("BEGIN");
      const updatedDiscount = await this._pool.query(updateQuery);
      await this._deleteProductDiscounts(discount_id);
      await this._addProductDiscounts(discount_id, products);
      await this._pool.query("COMMIT");
      return updatedDiscount.rows[0];
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async deleteDiscount(id) {
    const query = {
      text: `
        UPDATE discount SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id
      `,
      values: [id],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rows[0]) {
        throw new NotFoundError(
          "Failed to delete discount. Discount with that ID does not exist"
        );
      }

      return result.rows[0].id;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async _validateDiscount(
    discount_code,
    discount_type_id,
    start_date,
    end_date,
    products,
    discount_id = null
  ) {
    const checkQuery = {
      text: `
        SELECT discount_code FROM discount WHERE discount_code = $1 AND id != $2 AND deleted_at IS NULL
      `,
      values: [discount_code, discount_id],
    };

    const checkDiscountType = {
      text: `
        SELECT id FROM discount_type WHERE id = $1
      `,
      values: [discount_type_id],
    };

    const check = await this._pool.query(checkQuery);
    if (check.rows[0]) {
      throw new InvariantError(
        "Failed to add/edit discount. Discount code already used."
      );
    }

    const checkType = await this._pool.query(checkDiscountType);
    if (!checkType.rows[0]) {
      throw new NotFoundError(
        "Failed to add/edit discount. Discount type not found"
      );
    }

    if (new Date(start_date) > new Date(end_date)) {
      throw new InvariantError(
        "Failed to add/edit discount. Start date must be smaller than end date"
      );
    }

    const currentDate = new Date();
    if (currentDate > new Date(start_date)) {
      throw new InvariantError(
        "Failed to add/edit discount. Start date must be greater than current date"
      );
    }
    if (currentDate > new Date(end_date)) {
      throw new InvariantError(
        "Failed to add/edit discount. End date must be greater than current date"
      );
    }

    for (const product of products) {
      await this._validateProductDiscount(product, discount_type_id);
    }
  }

  async _validateProductDiscount(product, discount_type_id) {
    const checkProduct = {
      text: `
        SELECT id, price FROM products WHERE id = $1 AND deleted_at IS NULL FOR UPDATE
      `,
      values: [product.id],
    };
    const checkProductResult = await this._pool.query(checkProduct);
    if (!checkProductResult.rows[0]) {
      throw new InvariantError(`Product with ID ${product.id} not found`);
    }

    if (discount_type_id == 1 && product.discount_value > 100) {
      throw new InvariantError(
        `Failed to add/edit discount. Discount value for percentage must be less than 100% on product with ID ${product.id}`
      );
    }
    if (discount_type_id == 2 && product.discount_value % 100 !== 0) {
      throw new InvariantError(
        `Failed to add/edit discount. Discount value must be in hundreds on product with ID ${product.id}`
      );
    }

    const existingDiscountAmount = await this._getExistingDiscountAmount(
      product.id,
      checkProductResult.rows[0].price
    );
    const productCost = await this._getProductCost(product.id);

    const margin = checkProductResult.rows[0].price - productCost;
    const discountValue = product.discount_value;
    let discountAmount;

    if (discount_type_id == 1) {
      discountAmount =
        calculatePercentageDiscount(
          checkProductResult.rows[0].price,
          discountValue
        ) + existingDiscountAmount;
    } else {
      discountAmount = discountValue + existingDiscountAmount;
    }

    if (discountAmount > margin) {
      throw new InvariantError(
        `Product with ID ${
          product.id
        } incurs a loss with details: Purchase price ${productCost}, Selling price ${
          checkProductResult.rows[0].price
        }, Discount already applied to product ${existingDiscountAmount} and loss of ${
          margin - discountAmount
        } for additional discount of ${discountValue}`
      );
    }
  }

  async _getExistingDiscountAmount(product_id, product_price) {
    const checkProductDiscountQuery = {
      text: `
        SELECT pd.discount_id 
        FROM product_discount pd
        LEFT JOIN discount d ON pd.discount_id = d.id 
        WHERE d.end_date > CURRENT_TIMESTAMP AND d.deleted_at IS NULL AND pd.product_id = $1
      `,
      values: [product_id],
    };

    const checkProductDiscountResult = await this._pool.query(
      checkProductDiscountQuery
    );

    let existingDiscountAmount = 0;
    if (checkProductDiscountResult.rows[0]) {
      for (const discount of checkProductDiscountResult.rows) {
        const discountQuery = {
          text: `
            SELECT d.discount_type_id, pd.discount_value 
            FROM discount d
            LEFT JOIN product_discount pd ON d.id = pd.discount_id 
            WHERE d.id = $1 AND d.deleted_at IS NULL
          `,
          values: [discount.discount_id],
        };
        const discountResult = await this._pool.query(discountQuery);
        if (discountResult.rows[0].discount_type_id == 1) {
          existingDiscountAmount += calculatePercentageDiscount(
            product_price,
            discountResult.rows[0].discount_value
          );
        } else {
          existingDiscountAmount += discountResult.rows[0].discount_value;
        }
      }
    }

    return existingDiscountAmount;
  }

  async _getProductCost(product_id) {
    const checkProductCost = {
      text: `
        SELECT pd.cost
        FROM purchase_details pd 
        LEFT JOIN purchase p ON p.id = pd.purchase_id
        WHERE pd.product_id = $1 AND p.status_id = 2 AND pd.remaining_stock > 0 AND (pd.expiry_date IS NULL OR pd.expiry_date > CURRENT_TIMESTAMP) 
        ORDER BY p.created_at ASC
        LIMIT 1
      `,
      values: [product_id],
    };
    const productCostResult = await this._pool.query(checkProductCost);

    if (!productCostResult.rows[0]) {
      throw new InvariantError(`Product with ID ${product_id} has no stock`);
    }

    return productCostResult.rows[0].cost;
  }

  async _addProductDiscounts(discount_id, products) {
    for (const product of products) {
      const productDiscountQuery = {
        text: `
          INSERT INTO product_discount (product_id, discount_id, discount_value) VALUES ($1, $2, $3)
        `,
        values: [product.id, discount_id, product.discount_value],
      };
      await this._pool.query(productDiscountQuery);
    }
  }

  async _deleteProductDiscounts(discount_id) {
    const deleteProductDiscountQuery = {
      text: `
        DELETE FROM product_discount WHERE discount_id = $1
      `,
      values: [discount_id],
    };
    await this._pool.query(deleteProductDiscountQuery);
  }
}

module.exports = DiscountService;

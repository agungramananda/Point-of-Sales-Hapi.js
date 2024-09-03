const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { searchName } = require("../../utils/searchName");
const { pagination, getMaxPage } = require("../../utils/pagination");
class DiscountService {
  constructor() {
    this._pool = new Pool();
  }

  async getDiscounts({ code, page, limit }) {
    let query = `
    select 
    d.id,d.discount_code , d.discount_value , dt.type_name, d.description, d.start_date, d.end_date 
    from discount d 
    left join discount_type dt on d.discount_type_id = dt.id
    where d.deleted_at is null
    `;

    query = await searchName(
      { keyword: code },
      "discount d",
      "d.discount_code",
      query
    );

    const p = pagination({ limit, page });
    const infoPage = await getMaxPage(p, query);
    query += ` ORDER BY d.created_at DESC LIMIT ${p.limit} OFFSET ${p.offset}`;

    try {
      const result = await this._pool.query(query);
      return { data: result.rows, infoPage };
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
      d.discount_value,
      d.description,
      json_agg(json_build_object('product_id', p.id, 'product_name', p.product_name)) AS products
      FROM discount d
      LEFT JOIN discount_type dt ON d.discount_type_id = dt.id
      LEFT JOIN product_discount pd ON d.id = pd.discount_id
      LEFT JOIN products p ON pd.product_id = p.id
      WHERE d.id = $1 AND d.deleted_at is null
      GROUP BY 
      d.discount_code,
      dt.type_name,
      d.discount_value,
      d.description;
      `,
      values: [id],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rows[0]) {
        throw new NotFoundError(
          "Discount tidak ditemukan, Discount dengan ID tersebut tidak ada"
        );
      }

      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addDiscount({
    discount_code,
    discount_value,
    discount_type_id,
    start_date,
    end_date,
    products,
  }) {
    //products merupakan array of product_id
    const checkQuery = {
      text: `
      SELECT discount_code FROM discount WHERE discount_code = $1 AND deleted_at is null
      `,
      values: [discount_code],
    };

    const query = {
      text: `
      INSERT INTO discount (
        discount_code,
        discount_value,
        discount_type_id,
        start_date,
        end_date
      ) VALUES ($1, $2, $3, $4, $5) RETURNING id
      `,
      values: [
        discount_code,
        discount_value,
        discount_type_id,
        start_date,
        end_date,
      ],
    };

    try {
      await this._pool.query("BEGIN");
      const check = await this._pool.query(checkQuery);
      if (check.rows[0]) {
        throw new InvariantError(
          "Gagal menambahkan discount. Kode discount sudah digunakan."
        );
      }
      if (discount_type_id == 1 && discount_value > 100) {
        throw new InvariantError(
          "Gagal menambahkan discount. Discount value untuk percentage tidak boleh lebih dari 100%"
        );
      }

      if (discount_type_id == 2 && discount_value % 100 != 0) {
        throw new InvariantError(
          "Gagal menambahkan discount. Discount value untuk tidak boleh ada puluhan atau satuan"
        );
      }
      const result = await this._pool.query(query);
      for (const product of products) {
        const checkProduct = {
          text: `
          SELECT id FROM products WHERE id = $1 AND deleted_at is null for update
          `,
          values: [product],
        };
        const checkProductResult = await this._pool.query(checkProduct);
        if (!checkProductResult.rows[0]) {
          throw new InvariantError(
            `Product dengan ID ${product} tidak ditemukan`
          );
        }
        const productQuery = {
          text: `
          INSERT INTO product_discount (product_id, discount_id) VALUES ($1, $2)
          `,
          values: [product, result.rows[0].id],
        };
        await this._pool.query(productQuery);
      }
      await this._pool.query("COMMIT");
      return result.rows[0].id;
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async editDiscount(
    discount_id,
    {
      discount_code,
      discount_value,
      discount_type_id,
      start_date,
      end_date,
      products,
    }
  ) {
    // products merupakan array of product_id
    const checkQuery = {
      text: `
      SELECT discount_code FROM discount WHERE discount_code = $1 AND id != $2 AND deleted_at is null
      `,
      values: [discount_code, discount_id],
    };

    const updateQuery = {
      text: `
      UPDATE discount SET
        discount_code = $1,
        discount_value = $2,
        discount_type_id = $3,
        start_date = $4,
        end_date = $5
      WHERE id = $6 AND deleted_at is null
      RETURNING id
      `,
      values: [
        discount_code,
        discount_value,
        discount_type_id,
        start_date,
        end_date,
        discount_id,
      ],
    };

    try {
      await this._pool.query("BEGIN");

      const check = await this._pool.query(checkQuery);
      if (check.rows[0]) {
        throw new InvariantError(
          "Gagal mengedit discount. Kode discount sudah digunakan."
        );
      }

      const result = await this._pool.query(updateQuery);
      if (!result.rows[0]) {
        throw new InvariantError(
          "Gagal mengedit discount. Discount dengan ID tersebut tidak ada"
        );
      }

      const existingProductsQuery = {
        text: `
        SELECT product_id FROM product_discount WHERE discount_id = $1
        `,
        values: [discount_id],
      };

      const existingProductsResult = await this._pool.query(
        existingProductsQuery
      );
      const existingProductIds = existingProductsResult.rows.map(
        (row) => row.product_id
      );

      for (const product of products) {
        if (!existingProductIds.includes(product)) {
          const checkProduct = {
            text: `
            SELECT id FROM products WHERE id = $1 AND deleted_at is null FOR UPDATE
            `,
            values: [product],
          };
          const checkProductResult = await this._pool.query(checkProduct);
          if (!checkProductResult.rows[0]) {
            throw new InvariantError(
              `Product dengan ID ${product} tidak ditemukan`
            );
          }
          const productQuery = {
            text: `
            INSERT INTO product_discount (product_id, discount_id) VALUES ($1, $2)
            `,
            values: [product, discount_id],
          };
          await this._pool.query(productQuery);
        }
      }

      for (const existingProductId of existingProductIds) {
        if (!products.includes(existingProductId)) {
          const deleteProductQuery = {
            text: `
            DELETE FROM product_discount WHERE product_id = $1 AND discount_id = $2
            `,
            values: [existingProductId, discount_id],
          };
          await this._pool.query(deleteProductQuery);
        }
      }

      await this._pool.query("COMMIT");
      return result.rows[0].id;
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async deleteDiscount(id) {
    const query = {
      text: `
      UPDATE discount SET deleted_at = NOW() WHERE id = $1 AND deleted_at is null RETURNING id
      `,
      values: [id],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rows[0]) {
        throw new NotFoundError(
          "Discount tidak ditemukan, Discount dengan ID tersebut tidak ada"
        );
      }

      return result.rows[0].id;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = DiscountService;

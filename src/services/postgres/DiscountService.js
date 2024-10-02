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
    select 
    d.id,d.discount_code , dt.type_name, d.description, d.start_date, d.end_date 
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
      d.description,
      json_agg(json_build_object('product_id', p.id, 'product_name', p.product_name, 'discount_value',pd.discount_value)) AS products
      FROM discount d
      LEFT JOIN discount_type dt ON d.discount_type_id = dt.id
      LEFT JOIN product_discount pd ON d.id = pd.discount_id
      LEFT JOIN products p ON pd.product_id = p.id
      WHERE d.id = $1 AND d.deleted_at is null
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
    discount_type_id,
    start_date,
    end_date,
    products,
  }) {
    //products merupakan array yang berisi product_id dan discount values

    const checkQuery = {
      text: `
      SELECT discount_code FROM discount WHERE discount_code = $1 AND deleted_at is null
      `,
      values: [discount_code],
    };
    const checkDiscountType = {
      text: `
      SELECT id FROM discount_type WHERE id = $1
      `,
      values: [discount_type_id],
    };

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
      const check = await this._pool.query(checkQuery);
      if (check.rows[0]) {
        throw new InvariantError(
          "Gagal menambahkan discount. Kode discount sudah digunakan."
        );
      }
      const checkType = await this._pool.query(checkDiscountType);
      if (!checkType.rows[0]) {
        throw new NotFoundError("Discount type tidak ditemukan");
      }

      if (start_date > end_date) {
        throw new InvariantError(
          "Tanggal mulai tidak boleh lebih besar dari tanggal berakhir"
        );
      }

      const currentDate = new Date();
      if (currentDate > new Date(start_date)) {
        throw new InvariantError(
          "Tanggal mulai tidak boleh lebih kecil dari tanggal sekarang"
        );
      }
      if (currentDate > new Date(end_date)) {
        throw new InvariantError(
          "Tanggal berakhir tidak boleh lebih kecil dari tanggal sekarang"
        );
      }

      for (const product of products) {
        console.log(product);
        const checkProduct = {
          text: `
          SELECT id, price FROM products WHERE id = $1 AND deleted_at is null for update
          `,
          values: [product.id],
        };
        const checkProductResult = await this._pool.query(checkProduct);
        if (!checkProductResult.rows[0]) {
          throw new InvariantError(
            `Product dengan ID ${product.id} tidak ditemukan`
          );
        }
        if (discount_type_id == 1 && product.discount_value > 100) {
          throw new InvariantError(
            `Gagal menambahkan discount. Discount value untuk percentage tidak boleh lebih dari 100% pada product dengan ID ${product.id}`
          );
        }
        if (discount_type_id == 2 && product.discount_value % 100 != 0) {
          throw new InvariantError(
            `Gagal menambahkan discount. Discount value tidak boleh ada puluhan atau satuan pada product dengan ID ${product.id}`
          );
        }

        const checkProductDiscountQuery = {
          text: `
          select pd.discount_id 
          from product_discount pd
          left join discount d on pd.discount_id = d.id 
          where current_timestamp between d.start_date and d.end_date and d.deleted_at is null and pd.product_id = $1
          `,
          values: [product.id],
        };

        const checkProductDiscountResult = await this._pool.query(
          checkProductDiscountQuery
        );

        let existingDiscountAmount = 0;
        if (checkProductDiscountResult.rows[0]) {
          for (const discount of checkProductDiscountResult.rows) {
            const discountQuery = {
              text: `
              select d.discount_type_id, pd.discount_value 
              from discount d
              left join product_discount pd on d.id = pd.discount_id 
              where d.id = $1 and d.deleted_at is null
              `,
              values: [discount.discount_id],
            };
            const discountResult = await this._pool.query(discountQuery);
            if (discountResult.rows[0].discount_type_id == 1) {
              existingDiscountAmount += calculatePercentageDiscount(
                checkProductResult.rows[0].price,
                discountResult.rows[0].discount_value
              );
            } else {
              existingDiscountAmount += discountResult.rows[0].discount_value;
            }
          }
        }

        const checkProductCost = {
          text: `
          select pd.cost
          from purchase_details pd 
          left join purchase p on p.id = pd.purchase_id
          where pd.product_id = $1 and  p.status_id = 2 and pd.remaining_stock >0 and (pd.expiry_date is null or pd.expiry_date >current_timestamp) 
          order by p.created_at asc
          limit 1
          `,
          values: [product.id],
        };
        const productCost = await this._pool.query(checkProductCost);

        if (!productCost.rows[0]) {
          throw new InvariantError(
            `Product dengan ID ${product.id} tidak memiliki stock`
          );
        }

        const margin =
          checkProductResult.rows[0].price - productCost.rows[0].cost;
        console.log(margin);
        const discountValue = product.discount_value;
        if (discount_type_id == 1) {
          const discountAmount =
            calculatePercentageDiscount(
              checkProductResult.rows[0].price,
              discountValue
            ) + existingDiscountAmount;
          console.log(discountAmount);
          if (discountAmount > margin) {
            throw new InvariantError(
              `Discount value membuat product dengan ID ${
                product.id
              } menjadi rugi dengan rincian : Harga beli ${
                productCost.rows[0].price
              } , Harga jual ${
                checkProductResult.rows[0].price
              } , Discount yang sudah diterapkan pada product ${existingDiscountAmount} dan kerugian sebesar ${
                margin - discountAmount
              } untuk penambahan discount sebesar ${discountValue}%`
            );
          }
        }
        if (discount_type_id == 2) {
          const discountAmount = discountValue + existingDiscountAmount;
          console.log(product.discount_value);
          console.log(existingDiscountAmount);
          console.log(discountAmount);
          if (discountAmount > margin) {
            throw new InvariantError(
              `Product dengan ID ${
                product.id
              } menjadi rugi dengan rincian : Harga beli ${
                productCost.rows[0].price
              } ,Harga jual ${
                checkProductResult.rows[0].price
              }, Diskon yang sudah diterapkan pada product sebesar ${existingDiscountAmount} dan kerugian sebesar ${
                margin - discountAmount
              } untuk penambahan discount sebesar ${discountValue}`
            );
          }
        }
      }

      const newDiscount = await this._pool.query(discountQuery);
      for (const product of products) {
        const productDiscountQuery = {
          text: `
          INSERT INTO product_discount (product_id, discount_id, discount_value) VALUES ($1, $2, $3)`,
          values: [product.id, newDiscount.rows[0].id, product.discount_value],
        };
        await this._pool.query(productDiscountQuery);
      }
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
    const checkQuery = {
      text: `
      SELECT discount_code FROM discount WHERE discount_code = $1 AND id != $2 AND deleted_at is null
      `,
      values: [discount_code, discount_id],
    };

    const checkDiscountType = {
      text: `
      SELECT id FROM discount_type WHERE id = $1
      `,
      values: [discount_type_id],
    };

    const updateQuery = {
      text: `
      UPDATE discount SET
        discount_code = $1,
        discount_type_id = $2,
        start_date = $3,
        end_date = $4
      WHERE id = $5 AND deleted_at is null
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

      const check = await this._pool.query(checkQuery);
      if (check.rows[0]) {
        throw new InvariantError(
          "Gagal mengedit discount. Kode discount sudah digunakan."
        );
      }

      const checkType = await this._pool.query(checkDiscountType);
      if (!checkType.rows[0]) {
        throw new NotFoundError("Discount type tidak ditemukan");
      }

      for (const product of products) {
        if (discount_type_id == 1 && product.discount_value > 100) {
          throw new InvariantError(
            `Gagal mengedit discount. Discount value untuk percentage tidak boleh lebih dari 100% pada product dengan ID ${product.id}`
          );
        }
        if (discount_type_id == 2 && product.discount_value % 100 != 0) {
          throw new InvariantError(
            `Gagal mengedit discount. Discount value tidak boleh ada puluhan atau satuan pada product dengan ID ${product.id}`
          );
        }
        const checkProduct = {
          text: `
          SELECT id, price FROM products WHERE id = $1 AND deleted_at is null for update
          `,
          values: [product.id],
        };
        const checkProductResult = await this._pool.query(checkProduct);
        if (!checkProductResult.rows[0]) {
          throw new InvariantError(
            `Product dengan ID ${product.id} tidak ditemukan`
          );
        }

        const checkProductDiscountQuery = {
          text: `
          select pd.discount_id 
          from product_discount pd
          left join discount d on pd.discount_id = d.id 
          where d.end_date > current_timestamp and d.deleted_at is null and pd.product_id = $1
          `,
          values: [product.id],
        };

        const checkProductDiscountResult = await this._pool.query(
          checkProductDiscountQuery
        );

        let existingDiscountAmount = 0;
        if (checkProductDiscountResult.rows[0]) {
          for (const discount of checkProductDiscountResult.rows) {
            const discountQuery = {
              text: `
              select d.discount_type_id, pd.discount_value 
              from discount d
              left join product_discount pd on d.id = pd.discount_id 
              where d.id = $1 and d.deleted_at is null
              `,
              values: [discount.discount_id],
            };
            const discountResult = await this._pool.query(discountQuery);
            if (discountResult.rows[0].discount_type_id == 1) {
              existingDiscountAmount += calculatePercentageDiscount(
                checkProductResult.rows[0].price,
                discountResult.rows[0].discount_value
              );
            } else {
              existingDiscountAmount += discountResult.rows[0].discount_value;
            }
          }
        }

        const checkProductCost = {
          text: `
          select pd.cost
          from purchase_details pd 
          left join purchase p on p.id = pd.purchase_id
          where pd.product_id = $1 and  p.status_id = 2 and pd.remaining_stock >0 and (pd.expiry_date is null or pd.expiry_date >current_timestamp) 
          order by p.created_at asc
          limit 1
          `,
          values: [product.id],
        };
        const productCost = await this._pool.query(checkProductCost);

        if (!productCost.rows[0]) {
          throw new InvariantError(
            `Product dengan ID ${product.id} tidak memiliki stock`
          );
        }

        const margin =
          checkProductResult.rows[0].price - productCost.rows[0].cost;
        console.log(margin);
        const discountValue = product.discount_value;
        if (discount_type_id == 1) {
          const discountAmount =
            calculatePercentageDiscount(
              checkProductResult.rows[0].price,
              discountValue
            ) + existingDiscountAmount;
          console.log(discountAmount);
          if (discountAmount > margin) {
            throw new InvariantError(
              `Discount value membuat product dengan ID ${
                product.id
              } menjadi rugi dengan rincian harga beli ${
                productCost.rows[0].price
              } dan harga jual ${
                checkProductResult.rows[0].price
              } , Discount yang sudah diterapkan pada product ${existingDiscountAmount} dan kerugian sebesar ${
                margin - discountAmount
              } untuk discount sebesar ${discountValue}%`
            );
          }
        }
        if (discount_type_id == 2) {
          const discountAmount = discountValue + existingDiscountAmount;
          console.log(product.discount_value);
          console.log(existingDiscountAmount);
          console.log(discountAmount);
          if (discountAmount > margin) {
            throw new InvariantError(
              `Product dengan ID ${
                product.id
              } menjadi rugi dengan rincian : Harga beli ${
                productCost.rows[0].price
              } ,Harga jual ${
                checkProductResult.rows[0].price
              }, Diskon yang sudah diterapkan pada product sebesar ${existingDiscountAmount} dan kerugian sebesar ${
                margin - discountAmount
              } untuk penambahan discount sebesar ${discountValue}`
            );
          }
        }
      }

      const updatedDiscount = await this._pool.query(updateQuery);

      const deleteProductDiscountQuery = {
        text: `
        DELETE FROM product_discount WHERE discount_id = $1
        `,
        values: [discount_id],
      };
      await this._pool.query(deleteProductDiscountQuery);

      for (const product of products) {
        const productDiscountQuery = {
          text: `
          INSERT INTO product_discount (product_id, discount_id, discount_value) VALUES ($1, $2, $3)`,
          values: [product.id, discount_id, product.discount_value],
        };
        await this._pool.query(productDiscountQuery);
      }

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

/*
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
        "Gagal menambahkan discount. Discount value tidak boleh ada puluhan atau satuan"
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
*/

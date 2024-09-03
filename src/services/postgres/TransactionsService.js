const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { beetwenDate } = require("../../utils/betweenDate");
const calculatePercentageDiscount = require("../../utils/calculatePercentageDiscount");

class TransactionsService {
  constructor() {
    this._pool = new Pool();
  }

  async getTransactions({ startDate, endDate, page, limit }) {
    let query = `select
    t.id, t.user_id, t.total_items , t.subtotal , t.total_discount , t.total_price , t.payment , t."change" , t.created_at as transaction_date
    from transactions t where t.created_at is not null`;
    query = beetwenDate(startDate, endDate, "created_at", query);
    const p = pagination({ limit, page });
    const infoPage = await getMaxPage(p, query);
    const sql = {
      text: `${query} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      values: [p.limit, p.offset],
    };
    try {
      const result = await this._pool.query(sql);
      return { data: result.rows, infoPage };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getTransactionDetails(id) {
    const query = {
      text: `
      select 
      td.transaction_id ,td.product_id , td.product_price , td.quantity , td.subtotal , td.total_discount , td.total_price 
      from transaction_details td 
      WHERE transaction_id = $1`,
      values: [id],
    };
    try {
      const result = await this._pool.query(query);

      if (!result.rows[0]) {
        throw new NotFoundError("Transaksi tidak ada");
      }

      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addTransaction({ user_id, items, payment }) {
    //items = [{product_id, quantity}]
    const products = [];
    const verifyUser = {
      text: "SELECT id FROM users WHERE id = $1 AND status = 1 AND deleted_at IS NULL",
      values: [user_id],
    };

    try {
      const userIsMatch = await this._pool.query(verifyUser);

      if (!userIsMatch.rows[0]) {
        throw new NotFoundError("User tidak ada");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }

    await this._pool.query("BEGIN");

    try {
      for (const item of items) {
        const itemQuery = {
          text: `
          SELECT p.id, p.product_name, s.amount
          FROM products p
          JOIN stock s on p.id = s.product_id
          WHERE p.id = $1 AND deleted_at IS NULL
          FOR UPDATE
          `,
          values: [item.product_id],
        };
        const product = await this._pool.query(itemQuery);

        if (!product.rows[0]) {
          throw new NotFoundError(
            `Product dengan nama ${product.rows[0].product_name} tidak ada`
          );
        }

        if (item.quantity > product.rows[0].amount) {
          throw new InvariantError(
            `Stok barang tidak cukup untuk produk ${product.rows[0].product_name}. Stok tersedia :${product.rows[0].amount}`
          );
        }
      }

      for (const item of items) {
        const productQuery = {
          text: `
          select p.id, p.price, array_agg(pd.discount_id) as discount_list 
          from products p 
          left join product_discount pd on p.id = pd.product_id 
          where p.id = $1
          group by p.id
          `,
          values: [item.product_id],
        };
        const result = await this._pool.query(productQuery);
        const { id, price, discount_list } = result.rows[0];

        let total_discount = 0;
        let subtotal = 0;
        let total_price = 0;
        if (discount_list.length > 0) {
          for (const discount_id of discount_list) {
            const discountQuery = {
              text: `
              select d.discount_value, dt.type_name as discount_type
              from discount d 
              left join discount_type dt on d.discount_type_id = dt.id 
              where d.id = $1
              `,
              values: [discount_id],
            };
            const discount = await this._pool.query(discountQuery);
            if (discount.rows[0].discount_type == "Percentage") {
              total_discount += calculatePercentageDiscount(
                price,
                discount.rows[0].discount_value
              );
            } else {
              total_discount += discount.rows[0].discount_value;
            }
          }
          subtotal = price * item.quantity;
          total_price = subtotal - total_discount;
          if (total_price < 0) {
            total_discount = before_discount;
            total_price = 0;
          }
        }
        products.push({
          product_id: id,
          product_price: price,
          quantity: item.quantity,
          subtotal_product: price * item.quantity,
          total_product_discount: total_discount,
          total_product_price: total_price,
        });
      }

      let total_price = 0;
      let total_items = 0;
      let total_discount = 0;
      let subtotal = 0;
      for (const product of products) {
        total_price += product.total_product_price;
        total_items += product.quantity;
        total_discount += product.total_product_discount;
        subtotal += product.subtotal_product;
      }

      if (payment < total_price) {
        throw new InvariantError("Uang yang diberikan customer tidak cukup");
      }

      const change = payment - total_price;

      const transactionsQuery = {
        text: `
        INSERT INTO transactions (user_id, total_items, subtotal, total_discount,total_price, payment, change)
        VALUES ($1,$2,$3,$4,$5, $6, $7) RETURNING id
        `,
        values: [
          user_id,
          total_items,
          subtotal,
          total_discount,
          total_price,
          payment,
          change,
        ],
      };

      const transactionResult = await this._pool.query(transactionsQuery);

      const transaction_id = parseInt(transactionResult.rows[0].id);

      for (const product of products) {
        const transactionDetailQuery = {
          text: `
          INSERT INTO transaction_details 
          (transaction_id, product_id, product_price, quantity, total_price, subtotal, total_discount)
          VALUES ($1,$2,$3,$4, $5,$6,$7)
          `,
          values: [
            transaction_id,
            product.product_id,
            product.product_price,
            product.quantity,
            product.total_product_price,
            product.subtotal_product,
            product.total_product_discount,
          ],
        };
        await this._pool.query(transactionDetailQuery);
      }

      await this._pool.query("COMMIT");

      return transactionResult.rows;
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }
}

module.exports = TransactionsService;

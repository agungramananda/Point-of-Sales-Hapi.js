const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class TransactionsService {
  constructor() {
    this._pool = new Pool();
  }

  async getTransactions() {
    try {
      const result = await this._pool.query(`SELECT * FROM transactions`);
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getTransactionDetails(id) {
    const query = {
      text: `
      SELECT
      t.transaction_id, t.product_id, p.product_name, t.quantity, t.total_price
      FROM transaction_details t 
      LEFT JOIN
      products p ON t.product_id = p.id
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

  //optimalkan
  async addTransaction({ user_id, items, payment }) {
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

      const total_items = items.reduce((acc, curr) => acc + curr.quantity, 0);

      const total_price = items.reduce(
        (acc, curr) => acc + curr.product_price * curr.quantity,
        0
      );

      if (payment < total_price) {
        throw new InvariantError("Uang yang diberikan customer tidak cukup");
      }

      const change = payment - total_price;

      const transactionsQuery = {
        text: `
        INSERT INTO transactions (user_id, total_items, total_price, payment, change)
        VALUES ($1,$2,$3,$4,$5) RETURNING id
        `,
        values: [user_id, total_items, total_price, payment, change],
      };

      const transactionResult = await this._pool.query(transactionsQuery);

      const transaction_id = parseInt(transactionResult.rows[0].id);

      for (const item of items) {
        const detailQuery = {
          text: `
          INSERT INTO transaction_details (transaction_id, product_id, product_price, quantity, total_price)
          VALUES ($1, $2, $3, $4, $5)
          `,
          values: [
            transaction_id,
            item.product_id,
            item.product_price,
            item.quantity,
            item.product_price * item.quantity,
          ],
        };

        await this._pool.query(detailQuery);
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

const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class StockService {
  constructor() {
    this._pool = new Pool();
  }

  async getStockByProductId(id) {
    const query = {
      text: `
        SELECT s.product_id, p.product_name, s.amount, s.maximum_stock, s.safety_stock
        FROM stock s
        LEFT JOIN products p ON s.product_id = p.id
        WHERE s.product_id = $1 AND p.deleted_at IS NULL
      `,
      values: [id],
    };

    try {
      const result = await this._pool.query(query);
      if (result.rowCount === 0) {
        throw new NotFoundError("Product not found");
      }

      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async setStockSettings({ id, safetyStock, maximumStock }) {
    await this._validateProductExists(id);

    const query = {
      text: `
        UPDATE stock
        SET safety_stock = $1, maximum_stock = $2
        WHERE product_id = $3
        RETURNING product_id, safety_stock, maximum_stock
      `,
      values: [safetyStock, maximumStock, id],
    };

    try {
      const result = await this._pool.query(query);
      if (result.rowCount === 0) {
        throw new NotFoundError("Stock not found");
      }

      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async checkMaximumStock(product_id, addedStock) {
    const query = {
      text: `
        SELECT amount, maximum_stock
        FROM stock
        WHERE product_id = $1
      `,
      values: [product_id],
    };

    try {
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("Product not found");
      }

      const { amount, maximum_stock } = result.rows[0];
      if (amount + addedStock > maximum_stock) {
        throw new InvariantError(
          `Stock exceeds maximum limit for product with id ${product_id}`
        );
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async _validateProductExists(id) {
    const product = await this.getStockByProductId(id);
    if (product.length === 0) {
      throw new NotFoundError("Product not found");
    }
  }
}

module.exports = StockService;

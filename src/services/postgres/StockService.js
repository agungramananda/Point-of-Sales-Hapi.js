const { Pool } = require("pg");
const { searchName } = require("../../utils/searchName");
const { pagination, getMaxPage } = require("../../utils/pagination");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class StockService {
  constructor() {
    this._pool = new Pool();
  }

  async getStocks({ productName, page, limit }) {
    let query = `
      select s.product_id, p.product_name, s.amount, s.maximum_stock , s.safety_stock , s.reorder_point 
      from stock s 
      left join products p on s.product_id = p.id
      where p.deleted_at is null
    `;

    if (productName) {
      query = searchName(
        { keyword: productName },
        "products p",
        "p.product_name",
        query
      );
    }

    const p = pagination({ limit, page });
    const infoPage = await getMaxPage(p, query);
    query += ` LIMIT ${p.limit} OFFSET ${p.offset}`;

    try {
      const result = await this._pool.query(query);
      return { data: result.rows, infoPage };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getStockByProductId(id) {
    const query = {
      text: `
        SELECT s.product_id, p.product_name, s.amount, s.maximum_stock , s.safety_stock , s.reorder_point 
        FROM stock s
        LEFT JOIN products p ON s.product_id = p.id
        WHERE s.product_id = $1 and p.deleted_at is null
      `,
      values: [id],
    };

    try {
      const result = await this._pool.query(query);
      if (result.rowCount === 0) {
        throw new NotFoundError("stock not found");
      }

      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async setStockSettings({ id, safetyStock, maximumStock }) {
    const checkProduct = await this.getStockByProductId(id);
    if (checkProduct.length === 0) {
      throw new NotFoundError("product not found");
    }
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
        throw new NotFoundError("stock not found");
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
        throw new InvariantError("Produk tidak ditemukan");
      }

      const { amount, maximum_stock } = result.rows[0];
      if (amount + addedStock > maximum_stock) {
        throw new InvariantError(
          `stock melebihi batas maksimum untuk produk dengan id ${product_id}`
        );
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = StockService;

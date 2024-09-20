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
      select s.product_id, p.product_name, s.amount, s.maximum_stock_level , s.minimum_stock_level , s.reorder_point 
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
        SELECT s.product_id, p.product_name, s.amount, s.maximum_stock_level , s.minimum_stock_level , s.reorder_point 
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

  async setStockSettings({ id, maximumStockLevel, minimumStockLevel }) {
    const checkProduct = await this.getStockByProductId(id);
    if (checkProduct.length === 0) {
      throw new NotFoundError("product not found");
    }
    const query = {
      text: `
        UPDATE stock
        SET maximum_stock_level = $1, minimum_stock_level = $2
        WHERE product_id = $3
        RETURNING product_id, maximum_stock_level, minimum_stock_level
      `,
      values: [maximumStockLevel, minimumStockLevel, id],
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

  async setReorderPoint({ id, reorderPoint }) {
    const checkProduct = await this.getStockByProductId(id);
    if (checkProduct.length === 0) {
      throw new NotFoundError("product not found");
    }
    const query = {
      text: `
        UPDATE stock
        SET reorder_point = $1
        WHERE product_id = $2
        RETURNING product_id, reorder_point
      `,
      values: [reorderPoint, id],
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
}

module.exports = StockService;

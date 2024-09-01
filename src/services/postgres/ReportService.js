const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { beetwenDate } = require("../../utils/betweenDate");

class ReportService {
  constructor() {
    this._pool = new Pool();
  }

  async getSalesReport({ startDate, endDate, page, limit }) {
    let query = `
      SELECT 
      DATE(t.created_at) AS transaction_date,
      COUNT(t.id) AS total_transactions,
      SUM(t.total_price) AS total_sales
      FROM 
      transactions t
      WHERE t.created_at IS NOT NULL
      `;

    query = beetwenDate(startDate, endDate, "t.created_at", query);
    query += " GROUP BY DATE(t.created_at) ORDER BY DATE(t.created_at) DESC";
    console.log(query);
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

  async getPurchaseReport({ startDate, endDate, page, limit }) {
    let query = `
    SELECT p.id, s.supplier_name,i.product_name, p.quantity, p.price,p.total_price, p.created_at AS purchase_date
    FROM purchase p
    LEFT JOIN 
    suppliers s ON p.supplier_id = s.id
    LEFT JOIN
    products i ON p.product_id = i.id
    WHERE p.deleted_at IS NULL
    `;

    query = beetwenDate(startDate, endDate, "p.created_at", query);
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
}

module.exports = ReportService;

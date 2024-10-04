const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { beetwenDate } = require("../../utils/betweenDate");
const { searchName } = require("../../utils/searchName");

class ReportService {
  constructor() {
    this._pool = new Pool();
  }

  async getSalesReport({ startDate, endDate, page, limit }) {
    let query = `
      select * from sales_report where report_date is not null
      `;
    query = beetwenDate(startDate, endDate, "report_date", query);
    console.log(query);
    const p = pagination({ limit, page });
    const page_info = await getMaxPage(p, query);
    query += ` LIMIT ${p.limit} OFFSET ${p.offset}`;

    try {
      const result = await this._pool.query(query);
      return { data: result.rows, page_info };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getPurchaseReport({ startDate, endDate, page, limit }) {
    let query = `
    select * from purchase_report where report_date is not null
    `;
    query = beetwenDate(startDate, endDate, "report_date", query);
    const p = pagination({ limit, page });
    const page_info = await getMaxPage(p, query);
    query += ` LIMIT ${p.limit} OFFSET ${p.offset}`;

    try {
      const result = await this._pool.query(query);
      return { data: result.rows, page_info };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getStockReport({ productName, type, page, limit, startDate, endDate }) {
    let query = `
      select s.id, s.product_id, p.product_name, s.movement_type, s.quantity_change, s.references_id, s.created_at as "date" 
      from stockmovement s 
      left join products p ON s.product_id = p.id
      where s.created_at is not null
      `;

    if (productName) {
      query = searchName(
        { keyword: productName },
        "products p",
        "p.product_name",
        query
      );
    }

    if (type) {
      query += ` AND s.movement_type = '${type}'`;
    }

    query = beetwenDate(startDate, endDate, "s.created_at", query);

    const p = pagination({ limit, page });
    const page_info = await getMaxPage(p, query);
    query += ` LIMIT ${p.limit} OFFSET ${p.offset}`;
    try {
      const result = await this._pool.query(query);
      return { data: result.rows, page_info };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = ReportService;

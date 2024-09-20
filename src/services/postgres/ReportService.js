const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { beetwenDate } = require("../../utils/betweenDate");
const { searchName } = require("../../utils/searchName");
const { filterQuery } = require("../../utils/filterQuery");

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

  async getProductSalesReport({ date, page, limit }) {
    if (!date) {
      date = new Date().toISOString().split("T")[0];
    }
    let query = `
    SELECT
    p.product_name,
    SUM(t.quantity) AS total_sales,
    SUM(t.total_price) AS total_income
    FROM transaction_details t
    LEFT JOIN products p ON t.product_id = p.id
    where DATE(t.created_at) = '${date}'
    group by p.product_name 
    `;
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

  async getProductPurchaseReport({ date, page, limit }) {
    if (!date) {
      date = new Date().toISOString().split("T")[0];
    }
    let query = `
    SELECT
    i.product_name,
    SUM(p.quantity) AS total_purchase,
    SUM(p.total_price) AS total_expense
    FROM purchase p
    LEFT JOIN products i ON p.product_id = i.id
    WHERE DATE(p.created_at) = '${date}'
    GROUP BY i.product_name
    `;
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

  async getStockReport({ productName, type, page, limit, date }) {
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
      query = await filterQuery(
        { keyword: type },
        "stockmovement s",
        "s.movement_type",
        query
      );
    }

    if (date) {
      query += ` AND DATE(s.created_at) = '${date}'`;
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
}

module.exports = ReportService;

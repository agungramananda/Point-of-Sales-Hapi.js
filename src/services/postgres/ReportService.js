const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const { pagination, getMaxPage } = require("../../utils/pagination");

class ReportService {
  constructor() {
    this._pool = new Pool();
  }

  async getSalesReport({ startDate, endDate, page, limit }) {
    const query = {
      text: "SELECT transaction_date,total_income,total_transaction FROM sales_summary WHERE transaction_date BETWEEN $1 AND $2 ORDER BY transaction_date ASC",
      values: [startDate, endDate],
    };
    const p = pagination({ limit, page });

    query.text += ` LIMIT ${p.limit} OFFSET ${p.offset}`;

    try {
      const result = await this._pool.query(query);
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getPurchaseReport({ purchase_date, page, limit }) {
    const query = {
      text: `
      select 
        ps.id,
        ps.total_product,
        ps.total_price,
        extract (month from ps.purchase_date) as month,
        extract (year from ps.purchase_date) as year
        from purchase_summary ps 
        where ps.purchase_date = date_trunc('month',$1::TIMESTAMP)
      `,
      values: [purchase_date],
    };
    const p = pagination({ limit, page });

    query.text += ` LIMIT ${p.limit} OFFSET ${p.offset}`;

    try {
      const result = await this._pool.query(query);
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addSalesReport(date) {
    const query = {
      text: `
        INSERT INTO sales_summary (transaction_date, total_transaction, total_income)
        SELECT 
        DATE(t.created_at) AS transaction_date,
        COUNT(t.id) AS total_transaction,
        SUM(t.total_price) AS total_income 
        FROM 
        transactions t
        WHERE
        DATE(t.created_at) = $1
        GROUP BY 
        DATE(t.created_at)
        on conflict (transaction_date)
        do update set
        total_income = excluded.total_income,
        total_transaction = excluded.total_transaction 
        RETURNING id
      `,
      values: [date],
    };

    try {
      const result = await this._pool.query(query);
      if (result.rows.length == 0) {
        throw new InvariantError("Gagal membuat laporan");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addPurchaseReport({ purchase_date }) {
    const query = {
      text: `
        INSERT INTO purchase_summary (total_price, total_product, purchase_date)
        SELECT
        SUM(p.total_price) as total_price,
        SUM(p.quantity) as total_product,
        DATE_TRUNC('month', p.created_at) as purchase_date        
        from purchase p 
        where date_trunc('month',p.created_at) = date_trunc('month',$1::TIMESTAMP) 
        group by
        date_trunc('month',p.created_at) 
        on conflict (purchase_date)
        do update set
        total_price = excluded.total_price,
        total_product = excluded.total_product 
        RETURNING id
      `,
      values: [purchase_date],
    };

    try {
      const result = await this._pool.query(query);

      if (result.rows.length == 0) {
        throw new InvariantError("Gagal membuat laporan pembelian");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = ReportService;

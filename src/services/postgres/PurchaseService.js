const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { searchName } = require("../../utils/searchName");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { beetwenDate } = require("../../utils/betweenDate");

class PurchaseService {
  constructor(productService, supplierService, stockService) {
    this._pool = new Pool();
    this._productService = productService;
    this._supplierService = supplierService;
    this._stockService = stockService;
  }

  async _executeQuery(query) {
    try {
      const result = await this._pool.query(query);
      return result;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getPurchaseStatus() {
    const query = { text: `SELECT * FROM purchase_status` };
    const result = await this._executeQuery(query);
    return result.rows;
  }

  async getPurchaseStatusById(id) {
    const query = {
      text: `SELECT * FROM purchase_status WHERE id = $1`,
      values: [id],
    };
    const result = await this._executeQuery(query);
    if (result.rows.length === 0) {
      throw new NotFoundError("Purchase status not found");
    }
    return result.rows[0];
  }

  async getPurchase({ supplier, startDate, endDate, page, limit }) {
    let query = `
      SELECT p.id, p.supplier_id, s.supplier_name, p.purchase_date, p.total_cost, ps.status, p.received_date 
      FROM purchase p 
      LEFT JOIN suppliers s ON p.supplier_id = s.id 
      LEFT JOIN purchase_status ps ON p.status_id = ps.id
      WHERE p.purchase_date IS NOT NULL
    `;

    query = searchName(
      { keyword: supplier },
      "suppliers s",
      "s.supplier_name",
      query
    );

    if (startDate && endDate) {
      if (startDate > endDate) {
        throw new InvariantError("Start date cannot be greater than end date");
      }
      if (startDate === endDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      query = beetwenDate({ startDate, endDate }, "p.purchase_date", query);
    }

    const p = pagination({ limit, page });
    const page_info = await getMaxPage(p, query);
    query += ` LIMIT ${p.limit} OFFSET ${p.offset}`;
    const result = await this._executeQuery(query);
    return { data: result.rows, page_info };
  }

  async getPurchaseById(id) {
    const query = {
      text: `
        SELECT p.id, p.supplier_id, s.supplier_name, p.purchase_date, p.total_cost, ps.status, p.received_date
        FROM purchase p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        LEFT JOIN purchase_status ps ON p.status_id = ps.id
        WHERE p.id = $1
      `,
      values: [id],
    };
    const result = await this._executeQuery(query);
    if (result.rows.length === 0) {
      throw new NotFoundError("Purchase not found");
    }
    return result.rows[0];
  }

  async getPurchaseDetailsByPurchaseId(id) {
    const query = {
      text: `SELECT * FROM purchase_details pd WHERE pd.purchase_id = $1`,
      values: [id],
    };
    const result = await this._executeQuery(query);
    if (result.rows.length === 0) {
      throw new NotFoundError("Purchase details not found");
    }
    return result.rows;
  }

  async getPurchaseDetailsById(id) {
    const query = {
      text: `SELECT * FROM purchase_details pd WHERE pd.id = $1`,
      values: [id],
    };
    const result = await this._executeQuery(query);
    if (result.rows.length === 0) {
      throw new NotFoundError("Purchase details not found");
    }
    return result.rows[0];
  }

  async addPurchase({ supplier_id, purchase_date, products }) {
    await this._pool.query("BEGIN");
    try {
      await this._supplierService.getSupplierByID(supplier_id);

      const total_cost = products.reduce(
        (acc, product) => acc + product.quantity * product.cost,
        0
      );
      const query = {
        text: `INSERT INTO purchase (supplier_id, purchase_date, total_cost, status_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        values: [supplier_id, purchase_date, total_cost, 1],
      };
      const result = await this._executeQuery(query);
      const purchaseId = result.rows[0].id;

      for (const product of products) {
        const { product_id, quantity, cost, expiry_date } = product;
        await this._productService.getProductByID(product_id);
        await this._stockService.checkMaximumStock(product_id, quantity);
        const query = {
          text: `INSERT INTO purchase_details (purchase_id, product_id, quantity, cost, expiry_date, remaining_stock) VALUES ($1, $2, $3, $4, $5, $3)`,
          values: [purchaseId, product_id, quantity, cost, expiry_date],
        };
        await this._executeQuery(query);
      }

      await this._pool.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async editPurchase({ id, supplier_id, purchase_date, products }) {
    await this._pool.query("BEGIN");
    try {
      const updated_at = new Date();
      const checkPurchase = {
        text: `SELECT * FROM purchase WHERE id = $1`,
        values: [id],
      };
      const purchaseResult = await this._executeQuery(checkPurchase);
      if (purchaseResult.rows.length === 0) {
        throw new NotFoundError("Purchase not found");
      }

      if (purchaseResult.rows[0].status_id === 2) {
        throw new InvariantError("Cannot edit a completed purchase");
      }

      await this._supplierService.getSupplierByID(supplier_id);

      const total_cost = products.reduce(
        (acc, product) => acc + product.quantity * product.cost,
        0
      );
      const updatePurchaseQuery = {
        text: `UPDATE purchase SET supplier_id = $1, purchase_date = $2, total_cost = $3, updated_at = $4 WHERE id = $5 RETURNING id`,
        values: [supplier_id, purchase_date, total_cost, updated_at, id],
      };
      const result = await this._executeQuery(updatePurchaseQuery);

      const deletePurchaseDetailsQuery = {
        text: `DELETE FROM purchase_details WHERE purchase_id = $1`,
        values: [id],
      };
      await this._executeQuery(deletePurchaseDetailsQuery);

      for (const product of products) {
        const { product_id, quantity, cost, expiry_date } = product;
        await this._productService.getProductByID(product_id);
        await this._stockService.checkMaximumStock(product_id, quantity);
        const insertPurchaseDetailsQuery = {
          text: `INSERT INTO purchase_details (purchase_id, product_id, quantity, cost, expiry_date, remaining_stock) VALUES ($1, $2, $3, $4, $5, $3)`,
          values: [id, product_id, quantity, cost, expiry_date],
        };
        await this._executeQuery(insertPurchaseDetailsQuery);
      }

      await this._pool.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async completePurchase(id) {
    await this._pool.query("BEGIN");
    try {
      const updated_at = new Date();
      const received_date = new Date();
      const purchase = await this.getPurchaseById(id);
      const purchaseDetails = await this.getPurchaseDetailsByPurchaseId(id);
      if (purchase.status_id === 2) {
        throw new InvariantError("Purchase is already completed");
      }
      const query = {
        text: `UPDATE purchase SET status_id = 2, received_date = $1, updated_at = $2 WHERE id = $3 RETURNING id`,
        values: [received_date, updated_at, id],
      };
      const result = await this._executeQuery(query);

      for (const detail of purchaseDetails) {
        await this._insertReport({
          product_id: detail.product_id,
          total_purchase: detail.quantity,
          total_expense: detail.cost * detail.quantity,
          purchase_date: purchase.purchase_date,
        });
      }

      await this._pool.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async _checkReport(purchase_date, product_name) {
    const query = {
      text: `SELECT id FROM purchase_report WHERE product_name = $1 AND report_date = $2`,
      values: [product_name, purchase_date],
    };
    const result = await this._executeQuery(query);
    return result.rows[0];
  }

  async _insertReport({
    product_id,
    total_purchase,
    total_expense,
    purchase_date,
  }) {
    const product = await this._productService.getProductByID(product_id);
    const checkReport = await this._checkReport(
      purchase_date,
      product[0].product_name
    );
    if (checkReport) {
      await this._updateReport({
        product_name: product[0].product_name,
        total_purchase,
        total_expense,
        purchase_date,
      });
      return;
    }
    const query = {
      text: `INSERT INTO purchase_report (product_name, total_purchase, total_expense, report_date) VALUES ($1, $2, $3, $4)`,
      values: [
        product[0].product_name,
        total_purchase,
        total_expense,
        purchase_date,
      ],
    };
    await this._executeQuery(query);
  }

  async _updateReport({
    product_name,
    total_purchase,
    total_expense,
    purchase_date,
  }) {
    const query = {
      text: `UPDATE purchase_report SET total_purchase = total_purchase + $2, total_expense = total_expense + $3 WHERE product_name = $1 AND report_date = $4`,
      values: [product_name, total_purchase, total_expense, purchase_date],
    };
    await this._executeQuery(query);
  }
}

module.exports = PurchaseService;

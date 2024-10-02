const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const { searchName } = require("../../utils/searchName");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { beetwenDate } = require("../../utils/betweenDate");
const NotFoundError = require("../../exceptions/NotFoundError");

class PurchaseService {
  constructor(productService, supplierService, stockService) {
    this._pool = new Pool();
    this._productService = productService;
    this._supplierService = supplierService;
    this._stockService = stockService;
  }

  async getPurchaseStatus() {
    const query = {
      text: `SELECT * FROM purchase_status`,
    };
    try {
      const result = await this._pool.query(query);
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getPurchaseStatusById(id) {
    const query = {
      text: `SELECT * FROM purchase_status WHERE id = $1`,
      values: [id],
    };
    try {
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("purchase status not found");
      }
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getPurchase({ supplier, startDate, endDate, page, limit }) {
    try {
      let query = `
    select p.id,p.supplier_id , s.supplier_name, p.purchase_date, p.total_cost , ps.status , p.received_date 
    from purchase p 
    left join suppliers s on p.supplier_id = s.id 
    left join purchase_status ps on p.status_id = ps.id
    where p.purchase_date is not null
    `;

      query = searchName(
        { keyword: supplier },
        "suppliers s",
        "s.supplier_name",
        query
      );

      if (startDate && endDate) {
        if (startDate > endDate) {
          throw new InvariantError(
            "startDate tidak boleh lebih besar dari endDate"
          );
        }
        if (startDate === endDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
        query = beetwenDate({ startDate, endDate }, "p.purchase_date", query);
      }

      const p = pagination({ limit, page });
      const infoPage = await getMaxPage(p, query);
      query += ` LIMIT ${p.limit} OFFSET ${p.offset}`;
      const result = await this._pool.query(query);
      return { data: result.rows, infoPage };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getPurchaseById(id) {
    const query = {
      text: `
      select p.id,p.supplier_id , s.supplier_name, p.purchase_date, p.total_cost , ps.status , p.received_date
      from purchase p
      left join suppliers s on p.supplier_id = s.id
      left join purchase_status ps on p.status_id = ps.id
      where p.id = $1
    `,
      values: [id],
    };
    try {
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new InvariantError("purchase not found");
      }
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getPurchaseDetailsByPurchaseId(id) {
    const query = {
      text: `
        select * from purchase_details pd where pd.purchase_id = $1
      `,
      values: [id],
    };
    try {
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("purchase not found");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getPurchaseDetailsById(id) {
    const query = {
      text: `
        select * from purchase_details pd where pd.id = $1
      `,
      values: [id],
    };
    try {
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("purchase not found");
      }
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addPurchase({ supplier_id, purchase_date, products }) {
    //products = [{product_id, quantity,cost,expiry_date}]
    try {
      await this._pool.query("BEGIN");
      await this._supplierService.getSupplierByID(supplier_id);

      const total_cost = products?.reduce((acc, product) => {
        return acc + product.quantity * product.cost;
      }, 0);
      const query = {
        text: `
        INSERT INTO purchase (supplier_id, purchase_date, total_cost, status_id) 
        VALUES ($1, $2, $3, $4) RETURNING id
      `,
        values: [supplier_id, purchase_date, total_cost, 1],
      };
      const result = await this._pool.query(query);

      const purchaseId = result.rows[0].id;
      for (const product of products) {
        const { product_id, quantity, cost, expiry_date } = product;
        await this._productService.getProductByID(product_id);
        await this._stockService.checkMaximumStock(product_id, quantity);
        const query = {
          text: `
          INSERT INTO purchase_details (purchase_id, product_id, quantity, cost, expiry_date, remaining_stock)
          VALUES ($1, $2, $3, $4, $5, $3)
        `,
          values: [purchaseId, product_id, quantity, cost, expiry_date],
        };
        await this._pool.query(query);
      }
      await this._pool.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async editPurchase({ id, supplier_id, purchase_date, total_cost }) {
    try {
      const updated_at = new Date();
      const checkPurchase = {
        text: `SELECT * FROM purchase WHERE id = $1`,
        values: [id],
      };
      if (checkPurchase.rows.length === 0) {
        throw new NotFoundError("Purchase tidak ditemukan");
      }

      if (checkPurchase.rows[0].status === 2) {
        throw new InvariantError(
          "Tidak bisa mengubah data purchase yang sudah complete"
        );
      }

      await this._supplierService.getSupplierByID(supplier_id);

      const query = {
        text: `
      UPDATE purchase SET supplier_id = $1, purchase_date = $2, total_cost = $3, updated_at = $4
      WHERE id = $6 RETURNING id
    `,
        values: [supplier_id, purchase_date, total_cost, updated_at, id],
      };
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("Purchase tidak ditemukan");
      }
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async editPurchaseDetails({
    id,
    purchase_id,
    product_id,
    quantity,
    cost,
    expiry_date,
  }) {
    try {
      const purchase = await this.getPurchaseById(purchase_id);
      if (purchase.status_id === 2) {
        throw new InvariantError(
          "Tidak bisa mengubah data purchase yang sudah complete"
        );
      }
      await this.getPurchaseDetailsById(id);
      await this._productService.getProductByID(product_id);
      await this._stockService.checkMaximumStock(product_id, quantity);
      const query = {
        text: `
        UPDATE purchase_details SET purchase_id = $1, product_id = $2, quantity = $3, cost = $4, expiry_date = $5
        WHERE id = $6 RETURNING id
      `,
        values: [purchase_id, product_id, quantity, cost, expiry_date, id],
      };
      const result = await this._pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async completePurchase(id) {
    try {
      const updated_at = new Date();
      const received_date = new Date();
      const purchase = await this.getPurchaseById(id);
      if (purchase.status === 2) {
        throw new InvariantError("Purchase sudah complete");
      }
      const query = {
        text: `
        UPDATE purchase SET status_id = 2, received_date = $1, updated_at = $2
        WHERE id = $3 RETURNING id
      `,
        values: [received_date, updated_at, id],
      };
      const result = await this._pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.log(error);
      throw new InvariantError(error.message);
    }
  }
}

module.exports = PurchaseService;

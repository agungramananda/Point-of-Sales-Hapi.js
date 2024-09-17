const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const { searchName } = require("../../utils/searchName");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { beetwenDate } = require("../../utils/betweenDate");

class PurchaseService {
  constructor() {
    this._pool = new Pool();
  }

  async getAllPurchase({
    supplierName,
    productName,
    startDate,
    endDate,
    page,
    limit,
  }) {
    let query = `
    SELECT p.id, s.supplier_name, p.product_id,i.product_name, p.quantity, p.price,p.total_price, p.created_at AS purchase_date, p.expiry_date, p.remaining_stock
    FROM purchase p
    LEFT JOIN 
    suppliers s ON p.supplier_id = s.id
    LEFT JOIN
    products i ON p.product_id = i.id
    WHERE p.deleted_at IS NULL 
    `;
    query = searchName(
      { keyword: supplierName },
      "suppliers s",
      "s.supplier_name",
      query
    );
    query = searchName(
      { keyword: productName },
      "products i",
      "i.product_name",
      query
    );
    query = beetwenDate(startDate, endDate, "p.created_at", query);
    const p = pagination({ limit, page });
    const infoPage = await getMaxPage(p, query);
    const sql = {
      text: `${query} LIMIT $1 OFFSET $2`,
      values: [p.limit, p.offset],
    };
    try {
      const result = await this._pool.query(sql);
      return { data: result.rows, infoPage };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getPurchaseByID(id) {
    const query = {
      text: `
        SELECT p.id, s.supplier_name, p.product_id,i.product_name, p.quantity, p.price,p.total_price, p.created_at AS purchase_date, p.expiry_date, p.remaining_stock
        FROM purchase p
        LEFT JOIN 
        suppliers s ON p.supplier_id = s.id
        LEFT JOIN
        products i ON p.product_id = i.id
        WHERE p.deleted_at IS NULL AND p.id = $1 
      `,
      values: [id],
    };

    try {
      const result = await this._pool.query(query);

      if (result.rows.length == 0) {
        throw new InvariantError("Pembelian tidak ada");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addPurchase({ supplier_id, product_id, quantity, price, expiry_date }) {
    const checkProduct = {
      text: "SELECT id FROM products WHERE id=$1 AND deleted_at IS NULL",
      values: [product_id],
    };

    const checkSupplier = {
      text: "SELECT id FROM suppliers WHERE id=$1 AND deleted_at IS NULL",
      values: [supplier_id],
    };

    try {
      const product = await this._pool.query(checkProduct);
      const supplier = await this._pool.query(checkSupplier);
      if (product.rows.length == 0) {
        throw new InvariantError("Product tidak ada");
      }
      if (supplier.rows.length == 0) {
        throw new InvariantError("Supplier tidak ada");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }

    const total_price = quantity * price;
    const query = {
      text: "INSERT INTO purchase (supplier_id,product_id,quantity,price,total_price,expiry_date, remaining_stock) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
      values: [
        supplier_id,
        product_id,
        quantity,
        price,
        total_price,
        expiry_date,
        quantity,
      ],
    };

    try {
      const result = await this._pool.query(query);

      if (result.rows.length == 0) {
        throw new InvariantError("Gagal menambah pembelian");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = PurchaseService;

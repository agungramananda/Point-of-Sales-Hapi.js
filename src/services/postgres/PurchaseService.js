const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");

class PurchaseService {
  constructor() {
    this._pool = new Pool();
  }

  async getAllPurchase() {
    const query = `
    SELECT p.id, s.supplier_name, p.product_id,i.product_name, p.quantity, p.price,p.total_price, p.created_at AS purchase_date
    FROM purchase p
    LEFT JOIN 
    suppliers s ON p.supplier_id = s.id
    LEFT JOIN
    products i ON p.product_id = i.id
    WHERE p.deleted_at IS NULL 
    `;
    try {
      const result = await this._pool.query(query);
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getPurchaseByID(id) {
    const query = {
      text: `
        SELECT p.id, s.supplier_name, p.product_id,i.product_name, p.quantity, p.price,p.total_price, p.created_at AS purchase_date
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

  async addPurchase({ supplier_id, product_id, quantity, price, total_price }) {
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
    const query = {
      text: "INSERT INTO purchase (supplier_id,product_id,quantity,price,total_price) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      values: [supplier_id, product_id, quantity, price, total_price],
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

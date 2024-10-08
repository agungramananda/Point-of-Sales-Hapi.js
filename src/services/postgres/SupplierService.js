const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { searchName } = require("../../utils/searchName");

class SupplierService {
  constructor() {
    this._pool = new Pool();
  }

  async getAllSuppliers({ name, page, limit }) {
    let query = `
      SELECT s.id, s.supplier_name, s.contact, s.address 
      FROM suppliers s 
      WHERE s.deleted_at IS NULL
    `;
    query = searchName(
      { keyword: name },
      "suppliers s",
      "s.supplier_name",
      query
    );
    const p = pagination({ limit, page });
    const sql = {
      text: `${query} LIMIT $1 OFFSET $2`,
      values: [p.limit, p.offset],
    };
    const page_info = await getMaxPage(p, query);
    try {
      const result = await this._pool.query(sql);
      return { data: result.rows, page_info };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getSupplierByID(id) {
    const query = {
      text: "SELECT id, supplier_name, contact, address FROM suppliers WHERE id = $1 AND deleted_at IS NULL",
      values: [id],
    };

    try {
      const result = await this._pool.query(query);

      if (result.rows.length === 0) {
        throw new NotFoundError("Supplier not found");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addSupplier({ supplier_name, contact, address }) {
    await this._validateSupplierName(supplier_name);

    const query = {
      text: "INSERT INTO suppliers (supplier_name, contact, address) VALUES ($1, $2, $3) RETURNING id, supplier_name, contact, address",
      values: [supplier_name, contact, address],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows[0]) {
        throw new InvariantError("Failed to add supplier");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async editSupplierByID({ id, supplier_name, contact, address }) {
    await this._validateSupplierName(supplier_name, id);

    const updatedAt = new Date();
    const query = {
      text: "UPDATE suppliers SET supplier_name = $1, contact = $2, address = $3, updated_at = $4 WHERE id = $5 RETURNING id, supplier_name, contact, address, updated_at",
      values: [supplier_name, contact, address, updatedAt, id],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows[0]) {
        throw new NotFoundError("Supplier not found");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async deleteSupplierByID(id) {
    const deletedAt = new Date();
    const query = {
      text: "UPDATE suppliers SET deleted_at = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING id",
      values: [deletedAt, id],
    };

    try {
      const result = await this._pool.query(query);

      if (result.rows.length === 0) {
        throw new NotFoundError("Supplier not found");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async _validateSupplierName(supplier_name, id = null) {
    const checkQuery = {
      text: `SELECT id FROM suppliers WHERE supplier_name = $1 AND deleted_at IS NULL ${
        id ? "AND id != $2" : ""
      }`,
      values: id ? [supplier_name, id] : [supplier_name],
    };

    try {
      const isDuplicate = await this._pool.query(checkQuery);
      if (isDuplicate.rows.length > 0) {
        throw new InvariantError("Supplier name already in use");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = SupplierService;

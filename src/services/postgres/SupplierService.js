const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class SupplierService {
  constructor() {
    this._pool = new Pool();
  }

  async getAllSuppliers() {
    try {
      const result = await this._pool.query(
        "SELECT id,supplier_name,contact,address FROM suppliers WHERE deleted_at IS NULL"
      );
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getSupplierByID(id) {
    const query = {
      text: "SELECT id,supplier_name,contact,address FROM suppliers WHERE id = $1 AND deleted_at IS NULL",
      values: [id],
    };

    try {
      const result = await this._pool.query(query);

      if (result.rows.length == 0) {
        throw new NotFoundError("Supplier tidak ada");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addSupplier({ supplier_name, contact, address }) {
    const checkQuery = {
      text: "SELECT id FROM suppliers WHERE supplier_name = $1 AND deleted_at IS NULL",
      values: [supplier_name],
    };

    try {
      const isDuplicate = await this._pool.query(checkQuery);
      if (isDuplicate.rows[0]) {
        throw new InvariantError("Nama supplier sudah digunakan");
      }
    } catch (error) {
      throw new Error(error.message);
    }

    const query = {
      text: "INSERT INTO suppliers (supplier_name,contact,address) VALUES ($1,$2,$3) RETURNING id,supplier_name,contact,address",
      values: [supplier_name, contact, address],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows[0]) {
        throw new InvariantError("Supplier gagal ditambahkan");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async editSupplierByID({ id, supplier_name, contact, address }) {
    const updatedAt = new Date();
    const checkQuery = {
      text: "SELECT id FROM suppliers WHERE supplier_name = $1 AND id != $2 AND deleted_at IS NULL",
      values: [supplier_name, id],
    };

    try {
      const isDuplicate = await this._pool.query(checkQuery);
      if (isDuplicate.rows[0]) {
        throw new InvariantError("Nama supplier sudah digunakan");
      }
    } catch (error) {
      throw new Error(error.message);
    }

    const query = {
      text: "UPDATE suppliers SET supplier_name = $1, contact = $2, address = $3, updated_at = $4 WHERE id = $5 RETURNING id,supplier_name,contact,address,updated_at",
      values: [supplier_name, contact, address, updatedAt, id],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows[0]) {
        throw new InvariantError("Gagal mengubah data supplier");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async deleteSupplierByID(id) {
    const deleted_at = new Date();
    const query = {
      text: "UPDATE suppliers SET deleted_at = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING id",
      values: [deleted_at, id],
    };

    try {
      const result = await this._pool.query(query);

      if (result.rows.length == 0) {
        throw new InvariantError("Gagal menghapus supplier");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = SupplierService;

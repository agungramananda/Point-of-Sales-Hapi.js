const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { searchName } = require("../../utils/searchName");

class CustmoerService {
  constructor() {
    this._pool = new Pool();
  }

  async getCustomers({ name, page, limit }) {
    try {
      let query = `
      select 
      c.id, c.name, c.email, c.phone_number, c.address, m.membership_category, c.points, c.created_at as join_date
      from customer c
      left join membership m on c.membership_id = m.id
      where c.deleted_at is null
    `;
      query = await searchName(
        { keyword: name },
        "customer c",
        "c.name",
        query
      );
      const p = pagination({ limit, page });
      const infoPage = await getMaxPage(p, query);
      query += ` ORDER BY c.created_at DESC LIMIT ${p.limit} OFFSET ${p.offset}`;
      const result = await this._pool.query(query);
      return { data: result.rows, infoPage };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getCustomerById(id) {
    try {
      const query = {
        text: `
      select 
      c.id, c.name, c.email, c.phone_number, c.address, m.membership_category, c.points, c.created_at as join_date
      from customer c
      left join membership m on c.membership_id = m.id
      where c.deleted_at is null and c.id = $1`,
        values: [id],
      };
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("Customer tidak ditemukan");
      }
      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }

  async addCustomer({ name, email, phone_number, address, membership_id }) {
    await this._pool.query("BEGIN");
    try {
      const checkCustomer = await this._pool.query(
        `SELECT id FROM customer WHERE email = $1 and deleted_at is null`,
        [email]
      );
      if (checkCustomer.rows.length > 0) {
        throw new InvariantError(
          "Gagal menambahkan customer. Email sudah digunakan."
        );
      }
      const membership = await this._pool.query(
        `SELECT id from membership where id = $1`,
        [membership_id]
      );

      if (membership.rows.length === 0) {
        throw new InvariantError("Membership tidak ditemukan");
      }
      const points = 0;
      const query = {
        text: `INSERT INTO customer (name,email,phone_number,address,membership_id,points) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone_number, address, membership_id, points`,
        values: [name, email, phone_number, address, membership_id, points],
      };
      const result = await this._pool.query(query);
      await this._pool.query("COMMIT");
      return {
        newCustomer: result.rows[0],
      };
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async editCustomer(id, { name, email, phone_number, address }) {
    try {
      const checkCustomer = await this._pool.query(
        `SELECT id FROM customer WHERE id = $1 and deleted_at is null`,
        [id]
      );
      if (checkCustomer.rows.length === 0) {
        throw new NotFoundError("Customer tidak ditemukan");
      }
      const checkEmail = await this._pool.query(
        `SELECT id FROM customer WHERE email = $1 and id != $2 and deleted_at is null`,
        [email, id]
      );
      if (checkEmail.rows.length > 0) {
        throw new InvariantError(
          "Gagal memperbarui customer. Email sudah digunakan."
        );
      }
      const query = {
        text: `UPDATE customer SET name = $1, email = $2, phone_number = $3, address = $4 WHERE id = $5 and deleted_at is null RETURNING id`,
        values: [name, email, phone_number, address, id],
      };
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError("Customer tidak ditemukan");
      }
      return result.rows[0].id;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }

  async deleteCustomer(id) {
    try {
      const check = await this._pool.query(
        "SELECT id FROM customer WHERE id = $1 AND deleted_at is not null",
        [id]
      );
      if (check.rows.length !== 0) {
        throw new InvariantError("Customer tidak ditemukan");
      }
      const query = {
        text: `UPDATE customer SET deleted_at = current_timestamp WHERE id = $1 and deleted_at is null RETURNING id`,
        values: [id],
      };
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError("Customer tidak ditemukan");
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }
}

module.exports = CustmoerService;

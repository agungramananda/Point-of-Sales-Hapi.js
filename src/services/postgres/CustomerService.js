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
      c.id, c.name, c.email, c.phone_number, c.address, m.membership_category, c.start_date as join_date, c.end_date as membership_expired
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
      c.id, c.name, c.email, c.phone_number, c.address, m.membership_category, c.start_date as join_date, c.end_date as membership_expired
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

  async addCustomer({
    user_id,
    name,
    email,
    phone_number,
    address,
    membership_id,
  }) {
    await this._pool.query("BEGIN");
    try {
      const checkUser = await this._pool.query(
        `SELECT id FROM users WHERE id = $1 and status = 1 and deleted_at is null`,
        [user_id]
      );
      if (checkUser.rows.length === 0) {
        throw new InvariantError(`User dengan id ${user_id} tidak ditemukan`);
      }
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
        `SELECT duration, price from membership where id = $1`,
        [membership_id]
      );

      if (membership.rows.length === 0) {
        throw new InvariantError("Membership tidak ditemukan");
      }
      const duration = membership.rows[0].duration;
      const price = membership.rows[0].price;
      const start_date = new Date();
      const end_date = new Date();
      end_date.setDate(start_date.getDate() + duration);
      const note = "Membership Baru";
      const query = {
        text: `INSERT INTO customer (name,email,phone_number,address,membership_id,start_date,end_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, phone_number, address, membership_id, start_date, end_date`,
        values: [
          name,
          email,
          phone_number,
          address,
          membership_id,
          start_date,
          end_date,
        ],
      };
      const result = await this._pool.query(query);
      const insertTransaction = await this._pool.query(
        `insert into membership_transaction (user_id, membership_id, customer_id, start_date, end_date, note, price) values ($1, $2, $3, $4, $5,$6, $7) RETURNING id, user_id, membership_id, customer_id, start_date, end_date, note, price`,
        [
          user_id,
          membership_id,
          result.rows[0].id,
          start_date,
          end_date,
          note,
          price,
        ]
      );
      await this._pool.query("COMMIT");
      return {
        newCustomer: result.rows[0],
        invoice: insertTransaction.rows[0],
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

  async extendMembership(id, { user_id, membership_id }) {
    await this._pool.query("BEGIN");
    try {
      const checkUser = await this._pool.query(
        `SELECT id FROM users WHERE id = $1 and status = 1 and deleted_at is null`,
        [user_id]
      );
      if (checkUser.rows.length === 0) {
        throw new InvariantError(`User dengan id ${id} tidak ditemukan`);
      }
      const checkCustomer = await this._pool.query(
        `SELECT id, membership_id, start_date,end_date FROM customer WHERE id = $1 and deleted_at is null`,
        [id]
      );
      if (checkCustomer.rows.length === 0) {
        throw new NotFoundError("Customer tidak ditemukan");
      }
      const checkMembership = await this._pool.query(
        `SELECT duration, price from membership where id = $1`,
        [membership_id]
      );
      if (checkMembership.rows.length === 0) {
        throw new NotFoundError("Membership tidak ditemukan");
      }
      const duration = checkMembership.rows[0].duration;
      const end_date = checkCustomer.rows[0].end_date;
      end_date.setDate(end_date.getDate() + duration);
      let note = "Perpanjangan Membership";
      if (checkCustomer.rows[0].membership_id !== membership_id) {
        note = "Penggantian Membership";
      }
      const query = {
        text: `UPDATE customer SET membership_id = $1, end_date = $2 WHERE id = $3 and deleted_at is null RETURNING id,name,email,phone_number,address,membership_id,start_date,end_date`,
        values: [membership_id, end_date, id],
      };
      const result = await this._pool.query(query);
      const insertTransaction = await this._pool.query(
        `insert into membership_transaction (user_id, membership_id, customer_id, price, start_date, end_date, note) values ($1, $2, $3, $4, $5,$6, $7) RETURNING *`,
        [
          user_id,
          membership_id,
          id,
          checkMembership.rows[0].price,
          checkCustomer.rows[0].start_date,
          end_date,
          note,
        ]
      );
      await this._pool.query("COMMIT");
      return {
        customer: result.rows[0],
        message: note,
        invoice: insertTransaction.rows[0],
      };
    } catch (error) {
      await this._pool.query("ROLLBACK");
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }
}

module.exports = CustmoerService;

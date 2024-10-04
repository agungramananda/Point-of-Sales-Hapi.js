const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { searchName } = require("../../utils/searchName");

class CustomerService {
  constructor() {
    this._pool = new Pool();
  }

  async getCustomers({ name, page, limit }) {
    try {
      let query = `
        SELECT 
          c.id, c.name, c.email, c.phone_number, c.address, m.membership_category, c.points, c.created_at AS join_date
        FROM customer c
        LEFT JOIN membership m ON c.membership_id = m.id
        WHERE c.deleted_at IS NULL
      `;
      query = await searchName(
        { keyword: name },
        "customer c",
        "c.name",
        query
      );
      const p = pagination({ limit, page });
      const page_info = await getMaxPage(p, query);
      query += ` ORDER BY c.created_at DESC LIMIT ${p.limit} OFFSET ${p.offset}`;
      const result = await this._pool.query(query);
      return { data: result.rows, page_info };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getCustomerById(id) {
    try {
      const query = {
        text: `
          SELECT 
            c.id, c.name, c.email, c.phone_number, c.address, m.membership_category, c.points, c.created_at AS join_date
          FROM customer c
          LEFT JOIN membership m ON c.membership_id = m.id
          WHERE c.deleted_at IS NULL AND c.id = $1
        `,
        values: [id],
      };
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("Customer not found");
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
      await this._validateCustomerEmail(email);
      await this._validateMembership(membership_id);

      const points = 0;
      const query = {
        text: `
          INSERT INTO customer (name, email, phone_number, address, membership_id, points) 
          VALUES ($1, $2, $3, $4, $5, $6) 
          RETURNING id, name, email, phone_number, address, membership_id, points
        `,
        values: [name, email, phone_number, address, membership_id, points],
      };
      const result = await this._pool.query(query);
      await this._pool.query("COMMIT");
      return { newCustomer: result.rows[0] };
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async editCustomer(id, { name, email, phone_number, address }) {
    try {
      await this._validateCustomerExists(id);
      await this._validateCustomerEmail(email, id);

      const query = {
        text: `
          UPDATE customer 
          SET name = $1, email = $2, phone_number = $3, address = $4 
          WHERE id = $5 AND deleted_at IS NULL 
          RETURNING id
        `,
        values: [name, email, phone_number, address, id],
      };
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError("Customer not found");
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
      await this._validateCustomerExists(id);

      const query = {
        text: `
          UPDATE customer 
          SET deleted_at = current_timestamp 
          WHERE id = $1 AND deleted_at IS NULL 
          RETURNING id
        `,
        values: [id],
      };
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError("Customer not found");
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }

  async _validateCustomerEmail(email, id = null) {
    const query = {
      text: `
        SELECT id 
        FROM customer 
        WHERE email = $1 AND deleted_at IS NULL ${id ? "AND id != $2" : ""}
      `,
      values: id ? [email, id] : [email],
    };
    const result = await this._pool.query(query);
    if (result.rows.length > 0) {
      throw new InvariantError(
        "Failed to add/edit customer. Email already registered"
      );
    }
  }

  async _validateMembership(membership_id) {
    const query = {
      text: `
        SELECT id 
        FROM membership 
        WHERE id = $1
      `,
      values: [membership_id],
    };
    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new InvariantError("Failed to add customer. Membership not found");
    }
  }

  async _validateCustomerExists(id) {
    const query = {
      text: `
        SELECT id 
        FROM customer 
        WHERE id = $1 AND deleted_at IS NULL
      `,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError("Customer not found");
    }
  }
}

module.exports = CustomerService;

const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { searchName } = require("../../utils/searchName");
const { filterQuery } = require("../../utils/filterQuery");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class UserService {
  constructor() {
    this._pool = new Pool();
  }

  async getUsers({ name, role, page, limit }) {
    let query = `SELECT 
         u.id, u.username, u.name, r.role, u.status
         FROM users u
         LEFT JOIN
         roles r ON u.role_id = r.id
         WHERE 
         u.deleted_at IS NULL `;
    query = searchName({ keyword: name }, "users u", "u.name", query);
    query = await filterQuery({ keyword: role }, "roles r", "r.role", query);
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

  async getUserByID(id) {
    const query = {
      text: `
        SELECT 
         u.id, u.username, u.name, r.role, u.status
         FROM 
         users u
         LEFT JOIN
         roles r ON u.role_id = r.id
         WHERE 
         u.deleted_at IS NULL AND u.id = $1
         `,
      values: [id],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows[0]) {
        throw new NotFoundError("User tidak ditemukan");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addUser({ username, password, name, role_id }) {
    const checkQuery = {
      text: "SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL AND status = 1",
      values: [username],
    };

    try {
      const isDuplicate = await this._pool.query(checkQuery);

      if (isDuplicate.rows[0]) {
        throw new InvariantError("Username telah digunakan");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: `
        INSERT INTO users (username,password,name,role_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, name, role_id
      `,
      values: [username, hashedPassword, name, role_id],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rows[0]) {
        throw new InvariantError("User gagal ditambahkan");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async editUser({ id, username, password, name, role_id, status }) {
    const updated_at = new Date();
    const checkQuery = {
      text: "SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL AND status = 1 AND id != $2",
      values: [username, id],
    };

    try {
      const isDuplicate = await this._pool.query(checkQuery);

      if (isDuplicate.rows[0]) {
        throw new InvariantError("Username telah digunakan");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: "UPDATE users SET username = $1, password = $2, name = $3, role_id = $4, status = $5, updated_at = $6 WHERE id = $7 RETURNING id,username,name,role_id,status",
      values: [username, hashedPassword, name, role_id, status, updated_at, id],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rows[0]) {
        throw new NotFoundError("User tidak ditemukan");
      }

      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async deleteUser(id) {
    const deleted_at = new Date();
    const query = {
      text: "UPDATE users SET deleted_at = $1, status = 0 WHERE id = $2 AND deleted_at IS NULL RETURNING username,name",
      values: [deleted_at, id],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows[0]) {
        throw new NotFoundError("User tidak ada");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async verifyUser(id) {
    const query = {
      text: `select id from users where id = $1 and deleted_at is null`,
      values: [id],
    };

    try {
      const result = await this._pool.query(query);
      return result.rows[0].id;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
  async verifyUserCredential({ username, password }) {
    const query = {
      text: `SELECT u.id,u.password,r.role 
      FROM users u
      LEFT JOIN
      roles r on u.role_id = r.id
      WHERE username = $1 AND u.deleted_at IS NULL AND status = 1`,
      values: [username],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rows[0]) {
        throw new AuthenticationError("Username salah");
      }

      const { id, password: hashedPassword, role } = result.rows[0];

      const isMatch = await bcrypt.compare(password, hashedPassword);

      if (!isMatch) {
        throw new AuthenticationError("Password salah");
      }

      return { id, role };
    } catch (error) {
      throw new AuthenticationError(error.message);
    }
  }
}

module.exports = UserService;

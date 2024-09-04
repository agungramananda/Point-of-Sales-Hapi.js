const { Pool } = require("pg");
const { searchName } = require("../../utils/searchName");
const { pagination, getMaxPage } = require("../../utils/pagination");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class MembershipService {
  constructor() {
    this.pool = new Pool();
  }

  async getMembership({ membership_category, page, limit }) {
    try {
      let query = `SELECT m.id,m.membership_category,m.price,m.duration,m.percentage_discount from membership m where m.deleted_at is null`;
      query = await searchName(
        { keyword: membership_category },
        "membership m",
        "m.membership_category",
        query
      );
      const p = pagination({ limit, page });
      const infoPage = await getMaxPage(p, query);
      query += ` ORDER BY m.created_at DESC LIMIT ${p.limit} OFFSET ${p.offset}`;

      const result = await this.pool.query(query);
      return { data: result.rows, infoPage };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getMembershipById(id) {
    try {
      const query = {
        text: `SELECT m.id,m.membership_category,m.price,m.duration,m.percentage_discount from membership m where m.id = $1 and m.deleted_at is null`,
        values: [id],
      };
      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError("Membership tidak ditemukan");
      }
      return result.rows[0];
    } catch (error) {
      if (error.name == "NotFoundError") {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }

  async addMembership({
    membership_category,
    price,
    duration,
    percentage_discount,
  }) {
    if (percentage_discount > 100) {
      throw new InvariantError("Persentase diskon tidak boleh lebih dari 100");
    }
    try {
      const query = {
        text: `INSERT INTO membership (membership_category, price, duration, percentage_discount) VALUES ($1, $2, $3, $4) RETURNING id`,
        values: [membership_category, price, duration, percentage_discount],
      };
      const checkMembership = await this.pool.query(
        `SELECT id FROM membership WHERE membership_category = $1 and deleted_at is null`,
        [membership_category]
      );
      if (checkMembership.rows.length > 0) {
        throw new InvariantError("Membership sudah terdaftar");
      }
      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError("Membership gagal ditambahkan");
      }
      return result.rows[0].id;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async editMembership(
    id,
    { membership_category, price, duration, percentage_discount }
  ) {
    try {
      const checkMembership = await this.pool.query(
        `SELECT id FROM membership WHERE id != $1 and deleted_at is null and membership_category = $2`,
        [id, membership_category]
      );
      if (checkMembership.rows.length > 0) {
        throw new NotFoundError("Membership sudah terdaftar");
      }
      const query = {
        text: `UPDATE membership SET membership_category = $1, price = $2, duration = $3, percentage_discount = $4, updated_at = current_timestamp WHERE id = $5 and deleted_at is null RETURNING id`,
        values: [membership_category, price, duration, percentage_discount, id],
      };
      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError("Membership tidak ditemukan");
      }
    } catch (error) {
      if (error.name == "NotFoundError") {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }

  async deleteMembership(id) {
    try {
      const checkMembership = await this.pool.query(
        `SELECT id FROM membership WHERE id = $1 and deleted_at is not null`,
        [id]
      );
      if (checkMembership.rows.length > 0) {
        throw new NotFoundError("Membership tidak ditemukan");
      }
      const query = {
        text: `UPDATE membership SET deleted_at = current_timestamp WHERE id = $1 and deleted_at is null RETURNING id`,
        values: [id],
      };
      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError("Membership tidak ditemukan");
      }
    } catch (error) {
      if (error.name == "NotFoundError") {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }
}

module.exports = MembershipService;

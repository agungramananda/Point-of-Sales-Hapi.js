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
      let query = `SELECT m.id,m.membership_category,m.level, m.min_point from membership m where m.deleted_at is null`;
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
        text: `SELECT m.id,m.membership_category,m.level, m.min_point from membership m where m.id = $1 and m.deleted_at is null`,
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

  async addMembership({ membership_category, level, min_point }) {
    try {
      const query = {
        text: `INSERT INTO membership (membership_category, level, min_point) VALUES ($1, $2, $3) RETURNING id`,
        values: [membership_category, level, min_point],
      };
      const checkMembership = await this.pool.query(
        `SELECT id FROM membership WHERE membership_category = $1 and deleted_at is null`,
        [membership_category]
      );
      const checkLevel = await this.pool.query(
        `SELECT id FROM membership WHERE level = $1 and deleted_at is null`,
        [level]
      );
      if (checkLevel.rows.length > 0) {
        throw new InvariantError("Level sudah ada untuk membership");
      }
      if (checkMembership.rows.length > 0) {
        throw new InvariantError("Membership sudah terdaftar");
      }

      const lowerLevel = await this.pool.query(
        `SELECT min_point FROM membership WHERE level < $1 AND deleted_at is null ORDER BY level DESC LIMIT 1`,
        [level]
      );
      const upperLevel = await this.pool.query(
        `SELECT min_point FROM membership WHERE level > $1 AND deleted_at is null ORDER BY level ASC LIMIT 1`,
        [level]
      );

      if (
        lowerLevel.rows.length > 0 &&
        min_point <= lowerLevel.rows[0].min_point
      ) {
        throw new InvariantError(
          "min_point harus lebih besar dari level dibawahnya yaitu " +
            lowerLevel.rows[0].min_point
        );
      }
      if (
        upperLevel.rows.length > 0 &&
        min_point >= upperLevel.rows[0].min_point
      ) {
        throw new InvariantError(
          "min_point harus lebih kecil dari level diatasnya yaitu " +
            upperLevel.rows[0].min_point
        );
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

  async editMembership(id, { membership_category, level, min_point }) {
    try {
      const checkMembership = await this.pool.query(
        `SELECT id FROM membership WHERE id != $1 and membership_category = $2 and deleted_at is null`,
        [id, membership_category]
      );
      const checkLevel = await this.pool.query(
        `SELECT id FROM membership WHERE id != $1 and level = $2 and deleted_at is null`,
        [id, level]
      );
      if (checkLevel.rows.length > 0) {
        throw new InvariantError("Level sudah ada untuk membership");
      }
      if (checkMembership.rows.length > 0) {
        throw new InvariantError("Membership sudah terdaftar");
      }

      const lowerLevel = await this.pool.query(
        `SELECT min_point FROM membership WHERE level < $1 AND deleted_at is null ORDER BY level DESC LIMIT 1`,
        [level]
      );
      const upperLevel = await this.pool.query(
        `SELECT min_point FROM membership WHERE level > $1 AND deleted_at is null ORDER BY level ASC LIMIT 1`,
        [level]
      );

      if (
        lowerLevel.rows.length > 0 &&
        min_point <= lowerLevel.rows[0].min_point
      ) {
        throw new InvariantError(
          "min_point harus lebih besar dari level dibawahnya yaitu " +
            lowerLevel.rows[0].min_point
        );
      }
      if (
        upperLevel.rows.length > 0 &&
        min_point >= upperLevel.rows[0].min_point
      ) {
        throw new InvariantError(
          "min_point harus lebih kecil dari level diatasnya yaitu " +
            upperLevel.rows[0].min_point
        );
      }

      const query = {
        text: `UPDATE membership SET membership_category = $1, level = $2, min_point = $3, updated_at = current_timestamp WHERE id = $4 and deleted_at is null RETURNING id`,
        values: [membership_category, level, min_point, id],
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

  async updateMembershipLevel(customerId) {
    try {
      const query = {
        text: `SELECT points FROM customer WHERE id = $1 and deleted_at is null`,
        values: [customerId],
      };
      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError("Customer tidak ditemukan");
      }
      const points = result.rows[0].points;
      const membership = await this.pool.query(
        `SELECT id, min_point FROM membership WHERE $1 >= min_point and deleted_at is null ORDER BY level DESC LIMIT 1`,
        [points]
      );
      if (!membership.rows.length) {
        return;
      }
      const membershipId = membership.rows[0].id;
      const queryUpdate = {
        text: `UPDATE customer SET membership_id = $1 WHERE id = $2 and deleted_at is null`,
        values: [membershipId, customerId],
      };
      await this.pool.query(queryUpdate);
    } catch (error) {
      if (error.name === "NotFoundError") {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }

  async getPointsRules() {
    try {
      const query = `SELECT pr.id, pr.min_amount_of_transaction, pr.amount_of_spent, pr.points, pr.points_usage from points_rules pr`;
      const result = await this.pool.query(query);
      if (result.rows[0].points_usage == 0) {
        result.rows[0].points_usage = "Potongan Langsung";
      } else {
        result.rows[0].points_usage = "Redeem Voucher";
      }
      const description = `Setiap transaksi senilai ${result.rows[0].amount_of_spent} akan mendapatkan points sebesar ${result.rows[0].points} dengan syarat minimal belanja sebesar ${result.rows[0].min_amount_of_transaction}`;
      const data = { ...result.rows[0], description };
      return data;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async editPointsRules({
    min_amount_of_transaction,
    amount_of_spent,
    points,
    points_usage,
  }) {
    try {
      const checkPoints = await this.pool.query(`SELECT id FROM points_rules`);
      if (checkPoints.rows.length == 0) {
        throw new NotFoundError(
          "Points Rules tidak ditemukan silahkan buat rules baru"
        );
      }
      const id = checkPoints.rows[0].id;
      const query = {
        text: `UPDATE points_rules SET points = $1, min_amount_of_transaction = $2, amount_of_spent = $3, points_usage = $4 WHERE id = $5 RETURNING id`,
        values: [
          points,
          min_amount_of_transaction,
          amount_of_spent,
          points_usage,
          id,
        ],
      };
      const result = await this.pool.query(query);
      return result.rows[0].id;
    } catch (error) {
      if (error.name == "NotFoundError") {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }
}

module.exports = MembershipService;

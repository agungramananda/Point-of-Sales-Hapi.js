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
      let query = `SELECT m.id, m.membership_category, m.level, m.min_point FROM membership m WHERE m.deleted_at IS NULL`;
      query = await searchName(
        { keyword: membership_category },
        "membership m",
        "m.membership_category",
        query
      );
      const p = pagination({ limit, page });
      const page_info = await getMaxPage(p, query);
      query += ` ORDER BY m.created_at DESC LIMIT ${p.limit} OFFSET ${p.offset}`;

      const result = await this.pool.query(query);
      return { data: result.rows, page_info };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getMembershipById(id) {
    try {
      const query = {
        text: `SELECT m.id, m.membership_category, m.level, m.min_point FROM membership m WHERE m.id = $1 AND m.deleted_at IS NULL`,
        values: [id],
      };
      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError("Membership not found");
      }
      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }

  async addMembership({ membership_category, level, min_point }) {
    try {
      await this._validateMembership(membership_category, level, min_point);

      const query = {
        text: `INSERT INTO membership (membership_category, level, min_point) VALUES ($1, $2, $3) RETURNING id`,
        values: [membership_category, level, min_point],
      };

      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError("Failed to add membership");
      }
      return result.rows[0].id;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async editMembership(id, { membership_category, level, min_point }) {
    try {
      await this._validateMembership(membership_category, level, min_point, id);

      const query = {
        text: `UPDATE membership SET membership_category = $1, level = $2, min_point = $3, updated_at = current_timestamp WHERE id = $4 AND deleted_at IS NULL RETURNING id`,
        values: [membership_category, level, min_point, id],
      };
      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError("Membership not found");
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }

  async deleteMembership(id) {
    try {
      const checkMembership = await this.pool.query(
        `SELECT id FROM membership WHERE id = $1 AND deleted_at IS NOT NULL`,
        [id]
      );
      if (checkMembership.rows.length > 0) {
        throw new NotFoundError("Membership not found");
      }
      await this._checkCustomer(id);
      const query = {
        text: `UPDATE membership SET deleted_at = current_timestamp WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
        values: [id],
      };
      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError("Membership not found");
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }

  async updateMembershipLevel(customerId) {
    try {
      const query = {
        text: `SELECT points FROM customer WHERE id = $1 AND deleted_at IS NULL`,
        values: [customerId],
      };
      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError("Customer not found");
      }
      const points = result.rows[0].points;
      const membership = await this.pool.query(
        `SELECT id, min_point FROM membership WHERE $1 >= min_point AND deleted_at IS NULL ORDER BY level DESC LIMIT 1`,
        [points]
      );
      if (!membership.rows.length) {
        return;
      }
      const membershipId = membership.rows[0].id;
      const queryUpdate = {
        text: `UPDATE customer SET membership_id = $1 WHERE id = $2 AND deleted_at IS NULL`,
        values: [membershipId, customerId],
      };
      await this.pool.query(queryUpdate);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }

  async getPointsRules() {
    try {
      const query = `SELECT pr.id, pr.min_amount_of_transaction, pr.amount_of_spent, pr.points, pr.points_usage FROM points_rules pr`;
      const result = await this.pool.query(query);
      if (result.rows[0].points_usage == 0) {
        result.rows[0].points_usage = "Direct Discount";
      } else {
        result.rows[0].points_usage = "Redeem Voucher";
      }
      const description = `Each transaction worth ${result.rows[0].amount_of_spent} will earn points of ${result.rows[0].points} with a minimum spending requirement of ${result.rows[0].min_amount_of_transaction}`;
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
          "Points Rules not found, please create new rules"
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
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InvariantError(error.message);
    }
  }

  async _validateMembership(membership_category, level, min_point, id = null) {
    const checkMembership = await this.pool.query(
      `SELECT id FROM membership WHERE membership_category = $1 AND deleted_at IS NULL ${
        id ? "AND id != $2" : ""
      }`,
      id ? [membership_category, id] : [membership_category]
    );
    const checkLevel = await this.pool.query(
      `SELECT id FROM membership WHERE level = $1 AND deleted_at IS NULL ${
        id ? "AND id != $2" : ""
      }`,
      id ? [level, id] : [level]
    );
    if (checkLevel.rows.length > 0) {
      throw new InvariantError("Level already exists for membership");
    }
    if (checkMembership.rows.length > 0) {
      throw new InvariantError("Membership already registered");
    }

    const lowerLevel = await this.pool.query(
      `SELECT min_point FROM membership WHERE level < $1 AND deleted_at IS NULL ORDER BY level DESC LIMIT 1`,
      [level]
    );
    const upperLevel = await this.pool.query(
      `SELECT min_point FROM membership WHERE level > $1 AND deleted_at IS NULL ORDER BY level ASC LIMIT 1`,
      [level]
    );

    if (
      lowerLevel.rows.length > 0 &&
      min_point <= lowerLevel.rows[0].min_point
    ) {
      throw new InvariantError(
        `min_point must be greater than the level below which is ${lowerLevel.rows[0].min_point}`
      );
    }
    if (
      upperLevel.rows.length > 0 &&
      min_point >= upperLevel.rows[0].min_point
    ) {
      throw new InvariantError(
        `min_point must be less than the level above which is ${upperLevel.rows[0].min_point}`
      );
    }
  }

  async _checkCustomer(membership_id) {
    const query = {
      text: `SELECT id FROM customer WHERE membership_id = $1 AND deleted_at IS NULL`,
      values: [membership_id],
    };
    try {
      const result = await this.pool.query(query);
      if (result.rows.length > 0) {
        throw new InvariantError("There are customers with this membership");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = MembershipService;

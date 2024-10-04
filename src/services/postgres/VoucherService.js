const { Pool } = require("pg");
const { searchName } = require("../../utils/searchName");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { pagination, getMaxPage } = require("../../utils/pagination");

class VoucherService {
  constructor(customerService, membershipService) {
    this._customerService = customerService;
    this._membershipService = membershipService;
    this._pool = new Pool();
  }

  async getVouchers({ code, page, limit }) {
    let query = `
      SELECT v.id, v.code, v.membership_id, v.point_cost, v.discount_value, dt.type_name AS discount_type, v.min_transaction, v.max_discount, v.start_date, v.end_date, v.validity_period
      FROM vouchers v
      LEFT JOIN discount_type dt ON v.discount_type_id = dt.id
      WHERE v.deleted_at IS NULL
    `;

    query = searchName({ keyword: code }, "voucher v", "v.code", query);

    const p = pagination({ limit, page });
    const page_info = await getMaxPage(p, query);
    query += ` LIMIT ${p.limit} OFFSET ${p.offset}`;
    try {
      await this._validatePointsUsage();
      const result = await this._pool.query(query);
      return { data: result.rows, page_info };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getVoucherByCode(code) {
    const query = {
      text: `
        SELECT v.id, v.code, v.membership_id, v.point_cost, v.discount_value, dt.type_name AS discount_type, v.min_transaction, v.max_discount
        FROM vouchers v
        LEFT JOIN discount_type dt ON v.discount_type_id = dt.id
        WHERE v.code = $1 AND v.deleted_at IS NULL
      `,
      values: [code],
    };
    try {
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("Voucher not found");
      }
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getVoucherById(id) {
    const query = {
      text: `
        SELECT v.id, v.code, v.membership_id, v.point_cost, v.discount_value, dt.type_name AS discount_type, v.min_transaction, v.max_discount, v.start_date, v.end_date, v.validity_period
        FROM vouchers v
        LEFT JOIN discount_type dt ON v.discount_type_id = dt.id
        WHERE v.id = $1 AND v.deleted_at IS NULL
      `,
      values: [id],
    };
    try {
      await this._validatePointsUsage();
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("Voucher not found");
      }
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addVoucher({
    code,
    membership_id,
    point_cost,
    discount_type_id,
    discount_value,
    min_transaction,
    max_discount,
    start_date,
    end_date,
    validity_period,
  }) {
    try {
      await this._validatePointsUsage();
      await this._validateVoucherCode(code);

      const query = {
        text: `
          INSERT INTO vouchers (code, membership_id, point_cost, discount_type_id, discount_value, min_transaction, max_discount, start_date, end_date, validity_period)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id
        `,
        values: [
          code,
          membership_id,
          point_cost,
          discount_type_id,
          discount_value,
          min_transaction,
          max_discount,
          start_date,
          end_date,
          validity_period,
        ],
      };
      const result = await this._pool.query(query);
      return result.rows[0].id;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async editVoucher({
    id,
    code,
    membership_id,
    point_cost,
    discount_type_id,
    discount_value,
    min_transaction,
    max_discount,
    start_date,
    end_date,
    validity_period,
  }) {
    try {
      await this._validatePointsUsage();
      await this.getVoucherById(id);
      await this._validateVoucherCode(code, id);

      const query = {
        text: `
          UPDATE vouchers
          SET code = $1, membership_id = $2, point_cost = $3, discount_type_id = $4, discount_value = $5, min_transaction = $6, max_discount = $7, start_date = $8, end_date = $9, validity_period = $10
          WHERE id = $11
        `,
        values: [
          code,
          membership_id,
          point_cost,
          discount_type_id,
          discount_value,
          min_transaction,
          max_discount,
          start_date,
          end_date,
          validity_period,
          id,
        ],
      };
      await this._pool.query(query);
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async deleteVoucher(id) {
    try {
      await this._validatePointsUsage();
      const query = {
        text: `
          UPDATE vouchers
          SET deleted_at = current_timestamp
          WHERE id = $1 AND deleted_at IS NULL
          RETURNING id
        `,
        values: [id],
      };
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("Voucher not found");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async redeemPoinToVoucher({ voucher_id, customer_id }) {
    try {
      await this._validatePointsUsage();
      const customer = await this._customerService.getCustomerById(customer_id);
      const voucher = await this.getVoucherById(voucher_id);
      if (customer.points < voucher.point_cost) {
        throw new InvariantError("Insufficient points");
      }
      const now = new Date();
      const expired_date = new Date(
        now.setDate(now.getDate() + voucher.validity_period)
      );
      const query = {
        text: `
          INSERT INTO customer_vouchers (voucher_id, customer_id, expiry_date)
          VALUES ($1, $2, $3)
          RETURNING id
        `,
        values: [voucher_id, customer_id, expired_date],
      };
      await this._pool.query(query);
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getCustomerVouchers(customer_id) {
    try {
      await this._validatePointsUsage();
      const query = {
        text: `
          SELECT v.id, v.code, v.membership_id, v.point_cost, v.discount_value, dt.type_name AS discount_type, v.min_transaction, v.max_discount, cv.expiry_date 
          FROM vouchers v 
          LEFT JOIN discount_type dt ON v.discount_type_id = dt.id
          JOIN customer_vouchers cv ON v.id = cv.voucher_id
          WHERE cv.customer_id = $1 AND cv.deleted_at IS NULL AND (expiry_date > current_timestamp) AND is_used = false
        `,
        values: [customer_id],
      };
      const result = await this._pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async checkCustomerVoucher({ customer_id, voucher_id }) {
    const query = {
      text: `
        SELECT * FROM customer_vouchers WHERE voucher_id = $1 AND customer_id = $2 AND is_used = false AND deleted_at IS NULL
      `,
      values: [voucher_id, customer_id],
    };
    try {
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("Voucher not found");
      }
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async useVoucher({ voucher_id, customer_id }) {
    try {
      await this._validatePointsUsage();
      await this.getVoucherById(voucher_id);
      const query = {
        text: `
          UPDATE customer_vouchers
          SET is_used = true
          WHERE voucher_id = $1 AND customer_id = $2
        `,
        values: [voucher_id, customer_id],
      };
      await this._pool.query(query);
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async _validatePointsUsage() {
    const rules = await this._membershipService.getPointsRules();
    if (rules.points_usage !== "Redeem Voucher") {
      throw new InvariantError("Membership does not support point redemption");
    }
  }

  async _validateVoucherCode(code, id = null) {
    const checkQuery = {
      text: `SELECT id FROM vouchers WHERE code = $1 AND deleted_at IS NULL ${
        id ? "AND id != $2" : ""
      }`,
      values: id ? [code, id] : [code],
    };
    const checkVoucher = await this._pool.query(checkQuery);
    if (checkVoucher.rows.length > 0) {
      throw new InvariantError("Voucher code already in use");
    }
  }
}

module.exports = VoucherService;

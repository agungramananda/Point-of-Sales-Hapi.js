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
      select v.id, v.code, v.membership_id, v.point_cost, v.discount_value, dt.type_name as discount_type, v.min_transaction, v.max_discount, v.start_date, v.end_date, v.validity_period
      from vouchers v
      left join discount_type dt on v.discount_type_id = dt.id
      where v.deleted_at is null
    `;

    query = searchName({ keyword: code }, "voucher v", "v.code", query);

    const p = pagination({ limit, page });
    const infoPage = await getMaxPage(p, query);
    query += ` LIMIT ${p.limit} OFFSET ${p.offset}`;
    try {
      const rules = await this._membershipService.getPointsRules();
      if (rules.points_usage != "Redeem Voucher") {
        throw new InvariantError("Membership tidak mendukung penukaran poin");
      }
      const result = await this._pool.query(query);
      return { data: result.rows, infoPage };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getVoucherByCode(code) {
    const query = {
      text: `
        select v.id, v.code, v.membership_id, v.point_cost, v.discount_value, dt.type_name as discount_type, v.min_transaction, v.max_discount
        from vouchers v
        left join discount_type dt on v.discount_type_id = dt.id
        where v.code = $1 and v.deleted_at is null
      `,
      values: [code],
    };
    try {
      const result = await this._pool.query(query);

      if (result.rows.length === 0) {
        throw new NotFoundError("Voucher tidak ditemukan");
      }
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getVoucherById(id) {
    const query = {
      text: `
        select v.id, v.code, v.membership_id, v.point_cost, v.discount_value, dt.type_name as discount_type, v.min_transaction, v.max_discount, v.start_date, v.end_date, v.validity_period
        from vouchers v
        left join discount_type dt on v.discount_type_id = dt.id
        where v.id = $1 and v.deleted_at is null
      `,
      values: [id],
    };
    try {
      const rules = await this._membershipService.getPointsRules();
      if (rules.points_usage != "Redeem Voucher") {
        throw new InvariantError("Membership tidak mendukung penukaran poin");
      }
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("Voucher tidak ditemukan");
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
      const rules = await this._membershipService.getPointsRules();
      if (rules.points_usage != "Redeem Voucher") {
        throw new InvariantError("Membership tidak mendukung penukaran poin");
      }
      const query = {
        text: `INSERT INTO vouchers (code, membership_id, point_cost, discount_type_id, discount_value, min_transaction, max_discount, start_date, end_date, validity_period) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
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
      const checkVoucher = await this._pool.query(
        `SELECT id FROM vouchers WHERE code = $1 and deleted_at is null`,
        [code]
      );
      if (checkVoucher.rows.length > 0) {
        throw new InvariantError("Kode voucher sudah digunakan");
      }
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
      const rules = await this._membershipService.getPointsRules();
      if (rules.points_usage != "Redeem Voucher") {
        throw new InvariantError("Membership tidak mendukung penukaran poin");
      }
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
      await this.getVoucherById(id);
      const checkDuplicate = await this._pool.query(
        `SELECT id FROM vouchers WHERE code = $1 and id != $2 and deleted_at is null`,
        [code, id]
      );
      if (checkDuplicate.rows.length > 0) {
        throw new InvariantError("Kode voucher sudah digunakan");
      }
      await this._pool.query(query);
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async deleteVoucher(id) {
    try {
      const rules = await this._membershipService.getPointsRules();
      if (rules.points_usage != "Redeem Voucher") {
        throw new InvariantError("Membership tidak mendukung penukaran poin");
      }
      const query = {
        text: `UPDATE voucher SET deleted_at = current_timestamp WHERE id = $1 and deleted_at is null RETURNING id`,
        values: [id],
      };
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("Voucher tidak ditemukan");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async redeemPoinToVoucher({ voucher_id, customer_id }) {
    console.log(voucher_id, customer_id);
    const rules = await this._membershipService.getPointsRules();
    if (rules.points_usage != "Redeem Voucher") {
      throw new InvariantError("Membership tidak mendukung penukaran poin");
    }
    try {
      const customer = await this._customerService.getCustomerById(customer_id);
      const voucher = await this.getVoucherById(voucher_id);
      if (customer.points < voucher.point_cost) {
        throw new InvariantError("Poin tidak mencukupi");
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
    const rules = await this._membershipService.getPointsRules();
    if (rules.points_usage != "Redeem Voucher") {
      throw new InvariantError("Membership tidak mendukung penukaran poin");
    }
    const query = {
      text: `
               select v.id, v.code, v.membership_id, v.point_cost, v.discount_value, dt.type_name as discount_type, v.min_transaction, v.max_discount, cv.expiry_date 
        from vouchers v 
        left join discount_type dt on v.discount_type_id = dt.id
        join customer_vouchers cv on v.id = cv.voucher_id
        where cv.customer_id = $1 and cv.deleted_at is null and (expiry_date > current_timestamp) and is_used = false
      `,
      values: [customer_id],
    };
    try {
      const result = await this._pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async checkCustomerVoucher({ customer_id, voucher_id }) {
    const query = {
      text: `
        select * from customer_vouchers where voucher_id = $1 and customer_id = $2 and is_used = false and deleted_at is null
      `,
      values: [voucher_id, customer_id],
    };
    try {
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("Voucher tidak ditemukan");
      }
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async useVoucher({ voucher_id, customer_id }) {
    const rules = await this._membershipService.getPointsRules();
    if (rules.points_usage != "Redeem Voucher") {
      throw new InvariantError("Membership tidak mendukung penukaran poin");
    }
    try {
      await this.getVoucherById(voucher_id);
      const query = {
        text: `
          UPDATE customer_vouchers
          SET is_used = true
          WHERE voucher_id = $1 and customer_id = $2
        `,
        values: [voucher_id, customer_id],
      };
      await this._pool.query(query);
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = VoucherService;

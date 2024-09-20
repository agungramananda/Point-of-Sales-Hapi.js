const { Pool } = require("pg");

class CouponsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCoupon({ name, code, discount, expired }) {
    const query = {
      text: `INSERT INTO coupons (name, code, discount, expired) VALUES ($1, $2, $3, $4) RETURNING id`,
      values: [name, code, discount, expired],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }
}

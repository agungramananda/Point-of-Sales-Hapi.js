const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");

class AuthService {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(refresh_token) {
    const query = {
      text: "INSERT INTO tokens (refresh_token) VALUES ($1)",
      values: [refresh_token],
    };

    try {
      await this._pool.query(query);
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async verifyRefreshToken(refresh_token) {
    const query = {
      text: "SELECT refresh_token FROM tokens WHERE refresh_token = $1",
      values: [refresh_token],
    };

    try {
      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new InvariantError("Refresh token tidak valid");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async deleteRefreshToken(refresh_token) {
    const query = {
      text: "DELETE FROM tokens WHERE refresh_token = $1",
      values: [refresh_token],
    };

    try {
      await this._pool.query(query);
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = AuthService;

const Jwt = require("@hapi/jwt");
const InvariantError = require("../exceptions/InvariantError");

const TokenManager = {
  generateAccessToken: (payload) => {
    return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_SECRET);
  },
  generateRefreshToken: (payload) => {
    return Jwt.token.generate(payload, process.env.REFRESH_TOKEN_SECRET);
  },
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_SECRET);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError("Invalid refresh token");
    }
  },
};

module.exports = TokenManager;

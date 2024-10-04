const autoBind = require("auto-bind");

class AuthHandler {
  constructor(authService, usersService, tokenManager, validator) {
    this._authService = authService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
    autoBind(this);
  }

  async postAuthHandler(request, h) {
    this._validator.validateAuthPayload(request.payload);

    const { username, password } = request.payload;
    const { id, role: permission } =
      await this._usersService.verifyUserCredential({
        username,
        password,
      });

    const accessToken = this._tokenManager.generateAccessToken({
      id,
      permission,
    });

    const refreshToken = this._tokenManager.generateRefreshToken({
      id,
      permission,
    });

    await this._authService.addRefreshToken(refreshToken);

    return h
      .response({
        status: "success",
        data: {
          accessToken,
          refreshToken,
        },
      })
      .code(201);
  }

  async putAuthHandler(request) {
    const { refreshToken } = request.payload;
    await this._authService.verifyRefreshToken(refreshToken);
    const { id, permission } = await this._tokenManager.verifyRefreshToken(
      refreshToken
    );
    const accessToken = this._tokenManager.generateAccessToken({
      id,
      permission,
    });
    return {
      status: "success",
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthHandler(request) {
    const { refreshToken } = request.payload;
    await this._authService.verifyRefreshToken(refreshToken);
    await this._authService.deleteRefreshToken(refreshToken);

    return {
      status: "success",
      message: "Refresh token successfully deleted",
    };
  }
}

module.exports = AuthHandler;

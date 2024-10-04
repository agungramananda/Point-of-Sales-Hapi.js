const autoBind = require("auto-bind");

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getUsersHandler(request, h) {
    this._validator.validateUsersQuery(request.query);
    const { name, role, page, limit } = request.query;
    const { data, page_info } = await this._service.getUsers({
      name,
      role,
      page,
      limit,
    });

    return h
      .response({
        status: "success",
        data,
        page_info,
      })
      .code(200);
  }

  async getUserByIDHandler(request, h) {
    this._validator.validateUsersParams(request.params);

    const { id } = request.params;

    const user = await this._service.getUserByID(id);

    return h
      .response({
        status: "success",
        data: {
          user,
        },
      })
      .code(200);
  }

  async postUserHandler(request, h) {
    this._validator.validateUsersPayload(request.payload);

    const { username, password, name, role_id } = request.payload;

    const newUser = await this._service.addUser({
      username,
      password,
      name,
      role_id,
    });

    return h
      .response({
        status: "success",
        message: "User successfully added",
      })
      .code(201);
  }

  //belum melakukan pengecekan apakah user yang diedit adalah user yang sedang login
  async putUserByIDHandler(request, h) {
    this._validator.validateUsersParams(request.params);
    this._validator.validateUsersPayload(request.payload);

    const user_id = request.auth.credentials.id;
    const { id } = request.params;
    const { username, password, name, role_id, status } = request.payload;

    if (user_id == id) {
      return h
        .response({
          status: "fail",
          message:
            "Editing your own account is not allowed and may cause errors",
        })
        .code(403);
    }
    const editedUser = await this._service.editUser({
      id,
      username,
      password,
      name,
      role_id,
      status,
    });

    return h
      .response({
        status: "success",
        message: "User successfully updated",
      })
      .code(200);
  }

  //belum melakukan pengecekan apakah user yang diedit adalah user yang sedang login
  async deleteUserByIDHandler(request, h) {
    this._validator.validateUsersParams(request.params);

    const { id } = request.params;
    const user_id = request.auth.credentials.id;
    if (user_id == id) {
      return h
        .response({
          status: "fail",
          message: "You cannot delete your own account",
        })
        .code(403);
    }

    const deletedUser = await this._service.deleteUser(id);

    return h
      .response({
        status: "success",
        message: "User successfully deleted",
      })
      .code(200);
  }
}

module.exports = UsersHandler;

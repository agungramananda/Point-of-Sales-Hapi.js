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
    const { data, infoPage } = await this._service.getUsers({
      name,
      role,
      page,
      limit,
    });

    return h
      .response({
        status: "success",
        data,
        infoPage,
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
        message: "User berhasil ditambahkan",
        data: {
          newUser,
        },
      })
      .code(201);
  }

  async putUserByIDHandler(request, h) {
    this._validator.validateUsersParams(request.params);
    this._validator.validateUsersPayload(request.payload);

    const { id } = request.params;
    const { username, password, name, role_id, status } = request.payload;

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
        message: "User berhasil diubah",
        data: {
          editedUser,
        },
      })
      .code(200);
  }

  async deleteUserByIDHandler(request, h) {
    this._validator.validateUsersParams(request.params);

    const { id } = request.params;

    const deletedUser = await this._service.deleteUser(id);

    return h
      .response({
        status: "success",
        message: "Product berhasil dihapus",
        data: {
          deletedUser,
        },
      })
      .code(200);
  }
}

module.exports = UsersHandler;

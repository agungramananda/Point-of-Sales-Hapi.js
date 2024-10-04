const autoBind = require("auto-bind");

class RolesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async getRolesHandler(request, h) {
    this._validator.validateRoleQuery(request.query);
    const { role, page, limit } = request.query;
    const { data, page_info } = await this._service.getRoles({
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

  async getRoleByIdHandler(request, h) {
    this._validator.validateRoleParams(request.params);
    const { id } = request.params;
    const roles = await this._service.getRoleById(id);
    return h
      .response({
        status: "success",
        data: roles,
      })
      .code(200);
  }

  async postRoleHandler(request, h) {
    this._validator.validateRolePayload(request.payload);
    const { role, permissionsList } = request.payload;
    const roleId = await this._service.addRole({ role, permissionsList });
    return h
      .response({
        status: "success",
        message: "Role successfully added",
      })
      .code(201);
  }

  // Belum melakukan pengecekan agar ketika permissions diubah maka akan langsung diubah pada user yang memiliki role tersebut dan dapat terjadi kesalahan pada saat terdapat user sudah login
  /*
  async putRoleHandler(request, h) {
    this._validator.validateRoleParams(request.params);
    this._validator.validateRolePayload(request.payload);
    const { id } = request.params;
    const { role, permissionsList } = request.payload;
    await this._service.editRole({ id, role, permissionsList });
    return h
      .response({
        status: "success",
        message: "Role successfully updated",
      })
      .code(200);
  }

  async deleteRoleHandler(request, h) {
    this._validator.validateRoleParams(request.params);
    await this._service.deleteRole(id);
    return h
      .response({
        status: "success",
        message: "Role successfully deleted",
      })
      .code(200);
  }
      */

  async getPermissionsHandler(_, h) {
    const permissions = await this._service.getPermissions();
    return h
      .response({
        status: "success",
        data: {
          permissions,
        },
      })
      .code(200);
  }
}

module.exports = RolesHandler;

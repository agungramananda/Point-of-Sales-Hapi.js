const autoBind = require("auto-bind");

class CustomerHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }
  async postCustomerHandler(request, h) {
    this._validator.validateAddCustomer(request.payload);
    const { name, email, phone_number, address, membership_id } =
      request.payload;
    const data = await this._service.addCustomer({
      name,
      email,
      phone_number,
      address,
      membership_id,
    });
    return h
      .response({
        status: "success",
        message: "Customer berhasil ditambahkan",
        data: [data],
      })
      .code(201);
  }

  async getCustomersHandler(request, h) {
    this._validator.validateCustomerQuery(request.query);
    const { name, page, limit } = request.query;
    const { data, infoPage } = await this._service.getCustomers({
      name,
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

  async getCustomerByIdHandler(request, h) {
    this._validator.validateCustomerParams(request.params);
    const { id } = request.params;
    const data = await this._service.getCustomerById(id);
    return h
      .response({
        status: "success",
        data,
      })
      .code(200);
  }

  async putCustomerHandler(request, h) {
    this._validator.validateEditCustomer(request.payload);
    this._validator.validateCustomerParams(request.params);
    const { name, email, phone_number, address } = request.payload;
    const { id } = request.params;
    await this._service.editCustomer(id, {
      name,
      email,
      phone_number,
      address,
    });
    return h
      .response({
        status: "success",
        message: "Customer berhasil diperbarui",
      })
      .code(200);
  }

  async deleteCustomerHandler(request, h) {
    this._validator.validateCustomerParams(request.params);
    const { id } = request.params;
    await this._service.deleteCustomer(id);
    return h
      .response({
        status: "success",
        message: "Customer berhasil dihapus",
      })
      .code(200);
  }
}

module.exports = CustomerHandler;

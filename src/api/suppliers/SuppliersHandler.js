const autoBind = require("auto-bind");

class SuppliersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getSuppliersHandler(request, h) {
    this._validator.validateSupplierQuery(request.query);
    const { name, page, limit } = request.query;
    const { data, page_info } = await this._service.getAllSuppliers({
      name,
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

  async getSupplierByIDHandler(request, h) {
    this._validator.validateSupplierParams(request.params);

    const { id } = request.params;
    const supplier = await this._service.getSupplierByID(id);

    return h
      .response({
        status: "success",
        data: supplier,
      })
      .code(200);
  }

  async postSupplierHandler(request, h) {
    this._validator.validateSupplierPayload(request.payload);

    const { supplier_name, contact, address } = request.payload;

    const newSupplier = await this._service.addSupplier({
      supplier_name,
      contact,
      address,
    });

    return h
      .response({
        status: "success",
        message: "Supplier successfully added",
      })
      .code(201);
  }

  async putSupplierByIDHandler(request, h) {
    this._validator.validateSupplierParams(request.params);
    this._validator.validateSupplierPayload(request.payload);

    const { id } = request.params;
    const { supplier_name, contact, address } = request.payload;

    const editedSupplier = await this._service.editSupplierByID({
      id,
      supplier_name,
      contact,
      address,
    });

    return h
      .response({
        status: "success",
        message: "Supplier successfully updated",
      })
      .code(200);
  }

  async deleteSupplierByIDHandler(request, h) {
    this._validator.validateSupplierParams(request.params);

    const { id } = request.params;

    const deletedSupplier = await this._service.deleteSupplierByID(id);

    return h
      .response({
        status: "success",
        message: "Supplier successfully deleted",
      })
      .code(200);
  }
}

module.exports = SuppliersHandler;

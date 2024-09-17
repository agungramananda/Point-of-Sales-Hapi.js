const autoBind = require("auto-bind");

class PurchaseHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getAllPurchaseHandler(request, h) {
    this._validator.validatePurchaseQuery(request.query);
    const { supplierName, productName, page, limit } = request.query;
    const { data, infoPage } = await this._service.getAllPurchase({
      supplierName,
      productName,
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

  async getPurchaseByIDHandler(request, h) {
    this._validator.validatePurchaseParams(request.params);

    const { id } = request.params;
    const purchase = await this._service.getPurchaseByID(id);

    return h
      .response({
        status: "success",
        data: {
          purchase,
        },
      })
      .code(200);
  }

  async postPurchaseHandler(request, h) {
    this._validator.validatePurchasePayload(request.payload);

    const { supplier_id, product_id, quantity, price, expiry_date } =
      request.payload;

    const newPurchase = await this._service.addPurchase({
      supplier_id,
      product_id,
      quantity,
      price,
      expiry_date,
    });

    return h.response({
      status: "success",
      message: "Pembelian berhasil ditambahkan",
      data: {
        newPurchase,
      },
    });
  }
}

module.exports = PurchaseHandler;

const autoBind = require("auto-bind");

class PurchaseHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getPurchaseStatusHandler(_, h) {
    const purchaseStatus = await this._service.getPurchaseStatus();
    return h.response({
      status: "success",
      data: {
        purchaseStatus,
      },
    });
  }

  async getPurchaseHandler(request, h) {
    const { supplier, startDate, endDate, page, limit } = request.query;
    const purchases = await this._service.getPurchase({
      supplier,
      startDate,
      endDate,
      page,
      limit,
    });
    return h.response({
      status: "success",
      data: {
        purchases,
      },
    });
  }

  async getPurchaseDetailsByPurchaseIdHandler(request, h) {
    const { id } = request.params;
    const purchaseDetails = await this._service.getPurchaseDetailsByPurchaseId(
      id
    );
    return h.response({
      status: "success",
      data: {
        purchaseDetails,
      },
    });
  }

  async addPurchaseHandler(request, h) {
    const purchaseId = await this._service.addPurchase(request.payload);
    return h
      .response({
        status: "success",
        message: "Pembelian berhasil ditambahkan",
        data: {
          purchaseId,
        },
      })
      .code(201);
  }

  async editPurchaseHandler(request, h) {
    const { id } = request.params;
    await this._service.editPurchase({ id, ...request.payload });
    return h.response({
      status: "success",
      message: "Purchase updated successfully",
    });
  }

  async editPurchaseDetailsHandler(request, h) {
    const { id } = request.params;
    await this._service.editPurchaseDetails({ id, ...request.payload });
    return h.response({
      status: "success",
      message: "Purchase details updated successfully",
    });
  }

  async completePurchaseHandler(request, h) {
    const { id } = request.params;
    await this._service.completePurchase(id);
    return h.response({
      status: "success",
      message: "Purchase completed successfully",
    });
  }
}

module.exports = PurchaseHandler;

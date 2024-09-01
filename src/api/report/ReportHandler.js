const autoBind = require("auto-bind");

class ReportHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getSalesReportHandler(request, h) {
    this._validator.validateSalesReportQuery(request.query);
    let { startDate, endDate, page, limit } = request.query;

    const { data, infoPage } = await this._service.getSalesReport({
      startDate,
      endDate,
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

  async getPurchaseReportHandler(request, h) {
    this._validator.validatePurchaseReportQuery(request.query);
    const { startDate, endDate, page, limit } = request.query;
    const { data, infoPage } = await this._service.getPurchaseReport({
      startDate,
      endDate,
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

  async getProductSalesReportHandler(request, h) {
    this._validator.validateProductReportQuery(request.query);
    const { date, page, limit } = request.query;
    const { data, infoPage } = await this._service.getProductSalesReport({
      date,
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

  async getProductPurchaseReportHandler(request, h) {
    this._validator.validateProductReportQuery(request.query);
    const { date, page, limit } = request.query;
    const { data, infoPage } = await this._service.getProductPurchaseReport({
      date,
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
}

module.exports = ReportHandler;

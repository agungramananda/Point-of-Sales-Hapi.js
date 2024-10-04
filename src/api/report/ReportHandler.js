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

    const { data, page_info } = await this._service.getSalesReport({
      startDate,
      endDate,
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

  async getPurchaseReportHandler(request, h) {
    this._validator.validatePurchaseReportQuery(request.query);
    const { startDate, endDate, page, limit } = request.query;
    const { data, page_info } = await this._service.getPurchaseReport({
      startDate,
      endDate,
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

  async getStockReportHandler(request, h) {
    this._validator.validateStockReportQuery(request.query);
    const { page, limit, startDate, endDate, productName, type } =
      request.query;
    const { data, page_info } = await this._service.getStockReport({
      productName,
      type,
      page,
      limit,
      startDate,
      endDate,
    });

    return h
      .response({
        status: "success",
        data,
        page_info,
      })
      .code(200);
  }
}

module.exports = ReportHandler;

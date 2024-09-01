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

    const report = await this._service.getSalesReport({
      startDate,
      endDate,
      page,
      limit,
    });

    return h
      .response({
        status: "success",
        data: {
          report,
        },
      })
      .code(200);
  }

  async getPurchaseReportHandler(request, h) {
    this._validator.validatePurchaseReportQuery(request.query);
    const { startDate, endDate, page, limit } = request.query;
    const report = await this._service.getPurchaseReport({
      startDate,
      endDate,
      page,
      limit,
    });

    return h
      .response({
        status: "success",
        data: {
          report,
        },
      })
      .code(200);
  }

  async postSalesReportHandler(request, h) {
    const { date } = request.payload;
    const transaction_date = new Date(date);

    this._validator.validateSalesReportPayload({ transaction_date });
    const newReport = await this._service.addSalesReport(transaction_date);

    return h
      .response({
        status: "success",
        message: "Berhasil membuat laporan penjualan",
        data: {
          newReport,
        },
      })
      .code(201);
  }

  async postPurchaseReportHandler(request, h) {
    const { date } = request.payload;
    const purchase_date = new Date(date);
    this._validator.validatePurchaseReportPayload({ purchase_date });

    const newReport = await this._service.addPurchaseReport({ purchase_date });

    return h.response({
      status: "success",
      message: "Berhasil membuat laporan pembelian",
      data: {
        newReport,
      },
    });
  }
}

module.exports = ReportHandler;

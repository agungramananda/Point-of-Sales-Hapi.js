const autoBind = require("auto-bind");

class ReportHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getSalesReportHandler(request, h) {
    const { start, end } = request.query;

    const startDate = new Date(start);

    startDate.setDate(startDate.getDate() + -1);

    let endDate;

    if (!end) {
      endDate = new Date();
    } else {
      endDate = new Date(end);
    }

    endDate.setDate(endDate.getDate() + 1);

    this._validator.validateSalesReportQuery({ startDate, endDate });

    const report = await this._service.getSalesReport({ startDate, endDate });

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
    const { date } = request.query;

    const purchase_date = new Date(date);
    this._validator.validatePurchaseReportQuery({ purchase_date });

    const report = await this._service.getPurchaseReport({ purchase_date });

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
  /*
  async getProductSalesReportHandler(request, h) {
    this._validator.validateReportQuery(request.query);
    const { month, year } = request.query;

    const m = parseInt(month);
    const y = parseInt(year);

    const report = await this._service.getProductSalesReport({ m, y });

    return h
      .response({
        staus: "success",
        data: {
          report,
        },
      })
      .code(200);
  }

  async getProductPurchaseReportHandler(request, h) {
    this._validator.validateReportQuery(request.query);
    const { month, year } = request.query;

    const m = parseInt(month);
    const y = parseInt(year);

    const report = await this._service.getProductPurchaseReport({
      m,
      y,
    });

    return h
      .response({
        staus: "success",
        data: {
          report,
        },
      })
      .code(200);
  }

  async postProductSalesReportHandler(request, h) {
    this._validator.validateReportPayload(request.payload);
    const { month, year } = request.payload;

    await this._service.addProductSalesReport({ month, year });

    return h.response({
      status: "success",
      message: "Berhasil membuat laporan penjualan produk",
    });
  }

  async postProductPurchaseReportHandler(request, h) {
    this._validator.validateReportPayload(request.payload);
    const { month, year } = request.payload;

    await this._service.addProductPurchaseReport({ month, year });

    return h.response({
      status: "success",
      message: "Berhasil membuat laporan pembelian produk",
    });
  }
    */
}

module.exports = ReportHandler;

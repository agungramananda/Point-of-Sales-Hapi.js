const autoBind = require("auto-bind");

class TransactionsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getTransactionsHandler(request, h) {
    this._validator.validateTransactionsQuery(request.query);
    const { startDate, endDate, page, limit } = request.query;
    const { data, infoPage } = await this._service.getTransactions({
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

  async getTransactionDetailsHandler(request, h) {
    this._validator.validateTransactionsParams(request.params);
    const { id } = request.params;

    const transaction_details = await this._service.getTransactionDetails(id);

    return h
      .response({
        status: "success",
        data: {
          transaction_details,
        },
      })
      .code(200);
  }

  async postTransactionHandler(request, h) {
    this._validator.validateTransactionsPayload(request.payload);
    const { customer_id, items, payment, voucher, points_used } =
      request.payload;

    const user_id = request.auth.credentials.id;

    const newTransaction = await this._service.addTransaction({
      user_id,
      customer_id,
      items,
      payment,
      voucher,
      points_used,
    });

    return h
      .response({
        status: "success",
        message: "Transaksi berhasil ditambahkan",
        data: {
          newTransaction,
        },
      })
      .code(201);
  }
}

module.exports = TransactionsHandler;

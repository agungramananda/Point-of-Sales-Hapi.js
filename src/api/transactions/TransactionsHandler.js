const autoBind = require("auto-bind");

class TransactionsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getTransactionsHandler(request, h) {
    const { page, limit } = request.query;
    const transactions = await this._service.getTransactions({
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return h
      .response({
        status: "success",
        data: {
          transactions,
        },
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
    const { user_id, items, payment } = request.payload;

    const newTransaction = await this._service.addTransaction({
      user_id,
      items,
      payment,
    });

    return h
      .response({
        status: "success",
        message: "Product berhasil ditambahkan",
        data: {
          newTransaction,
        },
      })
      .code(201);
  }
}

module.exports = TransactionsHandler;

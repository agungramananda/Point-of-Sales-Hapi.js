const autoBind = require("auto-bind");

class StockHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async putStockSettingsHandler(request, h) {
    this._validator.validateStockParams(request.params);
    this._validator.validateEditStockSettings(request.payload);
    const { id } = request.params;
    const { safety_stock, maximum_stock } = request.payload;
    await this._service.setStockSettings({
      id,
      safetyStock: safety_stock,
      maximumStock: maximum_stock,
    });
    return h
      .response({
        status: "success",
        message: "Stock settings updated successfully",
      })
      .code(200);
  }
}

module.exports = StockHandler;

const autoBind = require("auto-bind");

class StockHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async getStocksHandler(request, h) {
    this._validator.validateStockQuery(request.query);
    const { productName, page, limit } = request.query;
    const { data, infoPage } = await this._service.getStocks({
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
  async getStockByIDHandler(request, h) {
    this._validator.validateStockParams(request.params);
    const { id } = request.params;
    const stock = await this._service.getStockByID(id);
    return h
      .response({
        status: "success",
        data: {
          stock,
        },
      })
      .code(200);
  }
  async putStockSettingsHandler(request, h) {
    this._validator.validateStockQuery(request.query);
    this._validator.validaateEditStockSettings(request.payload);
    const { id } = request.params;
    const { maximumStockLevel, minimumStockLevel } = request.payload;
    await this._service.setStockSettings({
      id,
      maximumStockLevel,
      minimumStockLevel,
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

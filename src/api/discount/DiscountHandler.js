const autoBind = require("auto-bind");

class DiscountHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async getDiscountsHandler(request, h) {
    this._validator.validateDiscountQuery(request.query);
    const { code, page, limit } = request.query;
    const { data, infoPage } = await this._service.getDiscounts({
      code,
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

  async getDiscountByIDHandler(request, h) {
    this._validator.validateDiscountParams(request.params);
    const { id } = request.params;
    const discount = await this._service.getDiscountByID(id);
    return h.response({
      status: "success",
      data: {
        discount,
      },
    });
  }

  async postDiscountHandler(request, h) {
    this._validator.validateDiscountPayload(request.payload);
    const {
      discount_code,
      discount_value,
      discount_type_id,
      start_date,
      end_date,
      description,
      products,
    } = request.payload;
    const discountId = await this._service.addDiscount({
      discount_code,
      discount_value,
      discount_type_id,
      start_date,
      end_date,
      description,
      products,
    });
    return h.response({
      status: "success",
      message: "Diskon berhasil ditambahkan",
      data: {
        discountId,
      },
    });
  }

  async editDiscountHandler(request, h) {
    this._validator.validateDiscountParams(request.params);
    this._validator.validateDiscountPayload(request.payload);
    const { id } = request.params;
    const {
      discount_code,
      discount_value,
      discount_type_id,
      start_date,
      end_date,
      description,
      products,
    } = request.payload;
    await this._service.editDiscount(id, {
      discount_code,
      discount_value,
      discount_type_id,
      start_date,
      end_date,
      description,
      products,
    });
    return h.response({
      status: "success",
      message: "Diskon berhasil diperbarui",
    });
  }

  async deleteDiscountHandler(request, h) {
    this._validator.validateDiscountParams(request.params);
    const { id } = request.params;
    await this._service.deleteDiscount(id);
    return h.response({
      status: "success",
      message: "Diskon berhasil dihapus",
    });
  }
}

module.exports = DiscountHandler;

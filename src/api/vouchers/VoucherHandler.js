const autoBind = require("auto-bind");

class VoucherHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getVouchersHandler(request, h) {
    this._validator.validateVouchersQuery(request.query);
    const { code, page, limit } = request.query;
    const vouchers = await this._service.getVouchers({
      code,
      page,
      limit,
    });
    return h
      .response({
        status: "success",
        data: vouchers.data,
        page_info: vouchers.page_info,
      })
      .code(200);
  }

  async getVoucherByIdHandler(request, h) {
    this._validator.validateVouchersParams(request.params);
    const { id } = request.params;
    const voucher = await this._service.getVoucherById(id);
    return h
      .response({
        status: "success",
        data: {
          voucher,
        },
      })
      .code(200);
  }

  async postVoucherHandler(request, h) {
    this._validator.validateVouchersPayload(request.payload);
    const {
      code,
      membership_id,
      point_cost,
      discount_type_id,
      discount_value,
      min_transaction,
      max_discount,
      start_date,
      end_date,
      validity_period,
    } = request.payload;
    const voucherId = await this._service.addVoucher({
      code,
      membership_id,
      point_cost,
      discount_type_id,
      discount_value,
      min_transaction,
      max_discount,
      start_date,
      end_date,
      validity_period,
    });

    return h
      .response({
        status: "success",
        message: "Voucher successfully added",
      })
      .code(201);
  }

  async editVoucherHandler(request, h) {
    this._validator.validateVouchersParams(request.params);
    this._validator.validateVouchersPayload(request.payload);
    const { id } = request.params;
    await this._service.editVoucher({ id, ...request.payload });
    return h.response({
      status: "success",
      message: "Voucher successfully updated",
    });
  }

  async deleteVoucherHandler(request, h) {
    this._validator.validateVouchersParams(request.params);
    const { id } = request.params;
    await this._service.deleteVoucher(id);
    return h.response({
      status: "success",
      message: "Voucher successfully deleted",
    });
  }

  async redeemPoinToVoucherHandler(request, h) {
    this._validator.validateRedeemVouchers(request.payload);
    const { voucher_id, customer_id } = request.payload;
    await this._service.redeemPoinToVoucher({ voucher_id, customer_id });
    return h.response({
      status: "success",
      message: "Poin successfully redeemed to voucher",
    });
  }

  async getCustomerVouchersHandler(request, h) {
    this._validator.validateVouchersParams(request.params);
    const { id } = request.params;
    const vouchers = await this._service.getCustomerVouchers(id);
    return h.response({
      status: "success",
      data: {
        vouchers,
      },
    });
  }
}

module.exports = VoucherHandler;

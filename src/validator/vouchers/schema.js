const Joi = require("joi");

const vouchersPayloadSchema = Joi.object({
  code: Joi.string().required(),
  membership_id: Joi.number().integer().required(),
  point_cost: Joi.number().integer().required(),
  discount_type_id: Joi.number().integer().required(),
  discount_value: Joi.number().integer().required(),
  min_transaction: Joi.number().integer().required(),
  max_discount: Joi.number().integer().required(),
  start_date: Joi.string().required(),
  end_date: Joi.string().required(),
  validity_period: Joi.number().integer().required(),
});

const vouchersQuerySchema = Joi.object({
  code: Joi.string().allow("").optional(),
  page: Joi.number().integer().allow("").optional(),
  limit: Joi.number().integer().allow("").optional(),
});

const vouchersParamsSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const redeemVouchersSchema = Joi.object({
  voucher_id: Joi.number().integer().required(),
  customer_id: Joi.number().integer().required(),
});

module.exports = {
  vouchersPayloadSchema,
  vouchersQuerySchema,
  vouchersParamsSchema,
  redeemVouchersSchema,
};

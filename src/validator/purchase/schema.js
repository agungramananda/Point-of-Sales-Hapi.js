const Joi = require("joi");

const PurchaseParamsSchema = Joi.object({
  id: Joi.string().required(),
});

const PurchasePayloadSchema = Joi.object({
  supplier_id: Joi.number().integer().required(),
  product_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().required(),
  price: Joi.number().required(),
  total_price: Joi.number().required(),
});

module.exports = { PurchaseParamsSchema, PurchasePayloadSchema };

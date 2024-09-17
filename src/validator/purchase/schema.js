const Joi = require("joi");

const PurchaseParamsSchema = Joi.object({
  id: Joi.string().required(),
});

const PurchasePayloadSchema = Joi.object({
  supplier_id: Joi.number().integer().required(),
  product_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().required(),
  price: Joi.number().required(),
  expiry_date: Joi.date().allow(null),
});

const PurchaseQuerySchema = Joi.object({
  supplierName: Joi.string().allow(""),
  productName: Joi.string().allow(""),
  page: Joi.number().integer().required(),
  limit: Joi.number().integer().required(),
});

module.exports = {
  PurchaseParamsSchema,
  PurchasePayloadSchema,
  PurchaseQuerySchema,
};

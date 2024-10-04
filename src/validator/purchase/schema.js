const Joi = require("joi");

const PurchaseParamsSchema = Joi.object({
  id: Joi.string().required(),
});

const PurchasePayloadSchema = Joi.object({
  supplier_id: Joi.number().integer().required(),
  purchase_date: Joi.date().iso().required(),
  products: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().required(),
        quantity: Joi.number().integer().required(),
        cost: Joi.number().integer().required(),
        expiry_date: Joi.string().required(),
      })
    )
    .required(),
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

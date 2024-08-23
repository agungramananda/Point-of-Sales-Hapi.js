const Joi = require("joi");

const SupplierParamsSchema = Joi.object({
  id: Joi.string().min(1).required(),
});

const SupplierPayloadSchema = Joi.object({
  supplier_name: Joi.string().required(),
  contact: Joi.string().required(),
  address: Joi.string().required(),
});

module.exports = { SupplierParamsSchema, SupplierPayloadSchema };

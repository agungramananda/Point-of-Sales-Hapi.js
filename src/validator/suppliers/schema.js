const Joi = require("joi");

const SupplierParamsSchema = Joi.object({
  id: Joi.string().min(1).required(),
});

const SupplierPayloadSchema = Joi.object({
  supplier_name: Joi.string().required(),
  contact: Joi.string().required(),
  address: Joi.string().required(),
});

const SupplierQuerySchema = Joi.object({
  name: Joi.string().allow("").default("").optional(),
  page: Joi.number().integer().default(1).optional().allow(""),
  limit: Joi.number().integer().default(25).optional().allow(""),
});

module.exports = {
  SupplierParamsSchema,
  SupplierPayloadSchema,
  SupplierQuerySchema,
};

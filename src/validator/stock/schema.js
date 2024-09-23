const Joi = require("joi");

const editStockSettigsSchema = Joi.object({
  maximumStockLevel: Joi.number().required(),
  minimumStockLevel: Joi.number().required(),
});

const StockParamSchema = Joi.object({
  id: Joi.string().required(),
});

const StockQuerySchema = Joi.object({
  productName: Joi.string().allow(""),
  page: Joi.number().allow("").default(1),
  limit: Joi.number().allow("").default(25),
});

module.exports = { editStockSettigsSchema, StockParamSchema, StockQuerySchema };

const Joi = require("joi");

const editStockSettigsSchema = Joi.object({
  safety_stock: Joi.number().required(),
  maximum_stock: Joi.number().required(),
});

const StockParamSchema = Joi.object({
  id: Joi.string().required(),
});

module.exports = { editStockSettigsSchema, StockParamSchema };

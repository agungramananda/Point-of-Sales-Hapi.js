const Joi = require("joi");

const ProductsParamsSchema = Joi.object({
  id: Joi.string().min(1).required(),
});

const ProductsPayloadSchema = Joi.object({
  product_name: Joi.string().required(),
  price: Joi.number().integer().required(),
  category_id: Joi.number().integer().required(),
  amount: Joi.number().integer().required(),
});

const ProductsEditStockSchema = Joi.object({
  amount: Joi.number().integer().required(),
});

const ProductsEditPriceSchema = Joi.object({
  price: Joi.number().integer().required(),
});

const ProductSortQuerySchema = Joi.object({
  sortBy: Joi.string()
    .valid("name", "category", "updated", "id")
    .default("id")
    .allow(""),
  orderBy: Joi.string()
    .valid("asc", "desc", "ASC", "DESC")
    .default("ASC")
    .allow(""),
});

module.exports = {
  ProductsParamsSchema,
  ProductsPayloadSchema,
  ProductsEditStockSchema,
  ProductsEditPriceSchema,
  ProductSortQuerySchema,
};

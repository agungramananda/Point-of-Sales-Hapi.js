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
  orderBy: Joi.string()
    .valid("name", "category", "updated", "id", "price")
    .default("id")
    .allow(""),
  sortBy: Joi.string()
    .valid("asc", "desc", "ASC", "DESC")
    .default("ASC")
    .allow(""),
  filter: Joi.string().allow("").default(""),
  name: Joi.string().allow("").default(""),
  page: Joi.string().default("1").allow(""),
  limit: Joi.string().default("25").allow(""),
});

module.exports = {
  ProductsParamsSchema,
  ProductsPayloadSchema,
  ProductsEditStockSchema,
  ProductsEditPriceSchema,
  ProductSortQuerySchema,
};

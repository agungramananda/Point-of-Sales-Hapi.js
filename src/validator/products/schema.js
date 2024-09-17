const Joi = require("joi");

const ProductsParamsSchema = Joi.object({
  id: Joi.string().min(1).required(),
});

const ProductsPayloadSchema = Joi.object({
  product_name: Joi.string().required(),
  price: Joi.number().integer().required(),
  category_id: Joi.number().integer().required(),
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
    .allow("")
    .optional(),
  sortBy: Joi.string()
    .valid("asc", "desc", "ASC", "DESC")
    .default("ASC")
    .allow("")
    .optional(),
  category: Joi.string().allow("").default("").optional(),
  name: Joi.string().allow("").default("").optional(),
  page: Joi.string().default("1").allow("").optional(),
  limit: Joi.string().default("25").allow("").optional(),
});

module.exports = {
  ProductsParamsSchema,
  ProductsPayloadSchema,
  ProductsEditStockSchema,
  ProductsEditPriceSchema,
  ProductSortQuerySchema,
};

const Joi = require("joi");

const CategoryPayloadSchema = Joi.object({
  category: Joi.string().required(),
});

const CategoryParamSchema = Joi.object({
  id: Joi.string().min(1).required(),
});

const CategoryQuerySchema = Joi.object({
  category: Joi.string().optional().allow(""),
  page: Joi.number().integer().min(1).default(1).optional().allow(""),
  limit: Joi.number().integer().min(1).default(25).optional().allow(""),
});

module.exports = {
  CategoryPayloadSchema,
  CategoryParamSchema,
  CategoryQuerySchema,
};

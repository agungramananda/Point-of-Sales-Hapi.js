const Joi = require("joi");

const CategoryPayloadSchema = Joi.object({
  category: Joi.string().required(),
});

const CategoryParamSchema = Joi.object({
  id: Joi.string().min(1).required(),
});

module.exports = { CategoryPayloadSchema, CategoryParamSchema };

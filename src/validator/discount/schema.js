const Joi = require("joi");

const DiscountQuerySchema = Joi.object({
  code: Joi.string().allow(""),
  page: Joi.number().default(1).allow(""),
  limit: Joi.number().default(5).allow(""),
});

const DiscountParamsSchema = Joi.object({
  id: Joi.number().required(),
});

const DiscountPayloadSchema = Joi.object({
  discount_code: Joi.string().required(),
  discount_type_id: Joi.number().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  description: Joi.string().allow(""),
  products: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
        discount_value: Joi.number().required(),
      })
    )
    .required(),
});

module.exports = {
  DiscountQuerySchema,
  DiscountParamsSchema,
  DiscountPayloadSchema,
};

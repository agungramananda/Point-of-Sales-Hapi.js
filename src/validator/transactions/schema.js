const Joi = require("joi");

const TransactionsParamsSchema = Joi.object({
  id: Joi.string().required(),
});

const TransactionsPayloadSchema = Joi.object({
  customer_id: Joi.number().integer().optional().allow(null),
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().required(),
        quantity: Joi.number().integer().required(),
      })
    )
    .required(),
  payment: Joi.number().integer().required(),
});

const TransactionsQuerySchema = Joi.object({
  startDate: Joi.date().allow(""),
  endDate: Joi.date().allow(""),
  page: Joi.number().integer().default(1),
  limit: Joi.number().integer().default(25),
});

module.exports = {
  TransactionsParamsSchema,
  TransactionsPayloadSchema,
  TransactionsQuerySchema,
};

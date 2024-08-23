const Joi = require("joi");

const TransactionsParamsSchema = Joi.object({
  id: Joi.string().required(),
});

const TransactionsPayloadSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().required(),
        product_price: Joi.number().integer().required(),
        quantity: Joi.number().integer().required(),
      })
    )
    .required(),
  payment: Joi.number().integer().required(),
});

module.exports = { TransactionsParamsSchema, TransactionsPayloadSchema };

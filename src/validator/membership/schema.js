const Joi = require("joi");

const MembershipQuerySchema = Joi.object({
  membership_category: Joi.string().allow(""),
  page: Joi.number().integer().default(1),
  limit: Joi.number().integer().default(25),
});

const MembershipPayloadSchema = Joi.object({
  membership_category: Joi.string().required(),
  price: Joi.number().required(),
  duration: Joi.number().required(),
  percentage_discount: Joi.number().required(),
});

const MembershipParamsSchema = Joi.object({
  id: Joi.number().required(),
});

module.exports = {
  MembershipQuerySchema,
  MembershipPayloadSchema,
  MembershipParamsSchema,
};

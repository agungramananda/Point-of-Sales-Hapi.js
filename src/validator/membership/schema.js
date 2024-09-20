const Joi = require("joi");

const MembershipQuerySchema = Joi.object({
  membership_category: Joi.string().allow(""),
  page: Joi.number().integer().default(1),
  limit: Joi.number().integer().default(25),
});

const MembershipPayloadSchema = Joi.object({
  membership_category: Joi.string().required(),
  level: Joi.number().required(),
  min_point: Joi.number().required(),
});

const MembershipParamsSchema = Joi.object({
  id: Joi.number().required(),
});

const PointsRulesPayloadSchema = Joi.object({
  min_amount_of_transaction: Joi.number().required().min(0),
  amount_of_spent: Joi.number().required().min(0),
  points: Joi.number().required().min(0),
});

module.exports = {
  MembershipQuerySchema,
  MembershipPayloadSchema,
  MembershipParamsSchema,
  PointsRulesPayloadSchema,
};

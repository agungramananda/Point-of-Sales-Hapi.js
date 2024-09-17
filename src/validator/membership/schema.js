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

module.exports = {
  MembershipQuerySchema,
  MembershipPayloadSchema,
  MembershipParamsSchema,
};

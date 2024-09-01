const Joi = require("joi");

const RolesParamsSchema = Joi.object({
  id: Joi.string().required(),
});

const RolesPayloadSchema = Joi.object({
  role: Joi.string().required(),
  permissionsList: Joi.array().items(Joi.number()).required(),
});

const RolesQuerySchema = Joi.object({
  role: Joi.string().allow("").default(""),
  page: Joi.number().allow("").default(1),
  limit: Joi.number().allow("").default(25),
});

module.exports = { RolesParamsSchema, RolesPayloadSchema, RolesQuerySchema };

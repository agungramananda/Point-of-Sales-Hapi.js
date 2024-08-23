const Joi = require("joi");

const UsersParamsSchema = Joi.object({
  id: Joi.string().min(1).required(),
});

const UsersPayloadSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  name: Joi.string().required(),
  role_id: Joi.number().integer().valid(1, 2, 3, 4, 5).required(),
  status: Joi.number().integer().valid(1, 0).required(),
});

module.exports = { UsersParamsSchema, UsersPayloadSchema };

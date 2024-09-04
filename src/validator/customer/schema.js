const Joi = require("joi");

const CustomerQuerySchema = Joi.object({
  name: Joi.string().allow(""),
  page: Joi.number().integer().default(1),
  limit: Joi.number().integer().default(25),
});

const CustomerParamsSchema = Joi.object({
  id: Joi.number().required(),
});

const AddCustomerSchema = Joi.object({
  user_id: Joi.number().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().required(),
  address: Joi.string().required(),
  membership_id: Joi.number().required(),
});

const EditCustomerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().required(),
  address: Joi.string().required(),
});

const ExtendMembershipSchema = Joi.object({
  user_id: Joi.number().required(),
  membership_id: Joi.number().required(),
});

module.exports = {
  CustomerQuerySchema,
  CustomerParamsSchema,
  AddCustomerSchema,
  EditCustomerSchema,
  ExtendMembershipSchema,
};

const Joi = require("joi");

const SalesReportQuerySchema = Joi.object({
  startDate: Joi.date().allow(""),
  endDate: Joi.date().allow(""),
  page: Joi.number().integer().allow("").default(1),
  limit: Joi.number().integer().min(1).allow("").default(25),
});

const PurchaseReportQuerySchema = Joi.object({
  startDate: Joi.date().allow(""),
  endDate: Joi.date().allow(""),
  page: Joi.number().integer().allow("").default(1),
  limit: Joi.number().integer().min(1).allow("").default(25),
});

const ProductReportQuerySchema = Joi.object({
  date: Joi.date().allow(""),
  page: Joi.number().integer().allow("").default(1),
  limit: Joi.number().integer().min(1).allow("").default(25),
});

module.exports = {
  SalesReportQuerySchema,
  PurchaseReportQuerySchema,
  ProductReportQuerySchema,
};

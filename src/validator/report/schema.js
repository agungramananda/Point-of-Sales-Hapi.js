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

const StockReportQuerySchema = Joi.object({
  page: Joi.number().integer().allow("").default(1),
  limit: Joi.number().integer().min(1).allow("").default(25),
  productName: Joi.string().allow(""),
  type: Joi.string().allow("").valid("TRANSACTION", "PURCHASE"),
  startDate: Joi.date().allow(""),
  endDate: Joi.date().allow(""),
});

module.exports = {
  SalesReportQuerySchema,
  PurchaseReportQuerySchema,
  StockReportQuerySchema,
};

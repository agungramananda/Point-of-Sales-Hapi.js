const Joi = require("joi");

const SalesReportQuerySchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
});

const SalesReportPayloadSchema = Joi.object({
  transaction_date: Joi.date().required(),
});

const PurchaseReportPayloadSchema = Joi.object({
  purchase_date: Joi.date().required(),
});

const PurchaseReportQuerySchema = Joi.object({
  purchase_date: Joi.date().required(),
});

module.exports = {
  SalesReportPayloadSchema,
  SalesReportQuerySchema,
  PurchaseReportPayloadSchema,
  PurchaseReportQuerySchema,
};

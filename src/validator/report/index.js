const InvariantError = require("../../exceptions/InvariantError");
const {
  SalesReportQuerySchema,
  SalesReportPayloadSchema,
  PurchaseReportPayloadSchema,
  PurchaseReportQuerySchema,
} = require("./schema");

const ReportValidator = {
  validateSalesReportQuery: (query) => {
    const validationResult = SalesReportQuerySchema.validate(query);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateSalesReportPayload: (payload) => {
    const validationResult = SalesReportPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePurchaseReportPayload: (payload) => {
    const validationResult = PurchaseReportPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePurchaseReportQuery: (query) => {
    const validationResult = PurchaseReportQuerySchema.validate(query);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ReportValidator;

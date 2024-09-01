const InvariantError = require("../../exceptions/InvariantError");
const {
  SalesReportQuerySchema,
  SalesReportPayloadSchema,
  PurchaseReportPayloadSchema,
  PurchaseReportQuerySchema,
  ProductReportQuerySchema,
} = require("./schema");

const ReportValidator = {
  validateSalesReportQuery: (query) => {
    const validationResult = SalesReportQuerySchema.validate(query);

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
  validateProductReportQuery: (query) => {
    const validationResult = ProductReportQuerySchema.validate(query);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ReportValidator;

const InvariantError = require("../../exceptions/InvariantError");
const { PurchaseParamsSchema, PurchasePayloadSchema } = require("./schema");

const PurchaseValidator = {
  validatePurchaseParams: (parmas) => {
    const validationResult = PurchaseParamsSchema.validate(parmas);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePurchasePayload: (payload) => {
    const validationResult = PurchasePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PurchaseValidator;

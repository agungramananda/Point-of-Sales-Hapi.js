const InvariantError = require("../../exceptions/InvariantError");
const {
  DiscountPayloadSchema,
  DiscountParamsSchema,
  DiscountQuerySchema,
} = require("./schema");

const DiscountValidator = {
  validateDiscountPayload: (payload) => {
    const validationResult = DiscountPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDiscountParams: (params) => {
    const validationResult = DiscountParamsSchema.validate(params);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDiscountQuery: (query) => {
    const validationResult = DiscountQuerySchema.validate(query);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = DiscountValidator;

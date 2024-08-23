const InvariantError = require("../../exceptions/InvariantError");
const {
  TransactionsPayloadSchema,
  TransactionsParamsSchema,
} = require("./schema");

const TransactionsValidator = {
  validateTransactionsPayload: (payload) => {
    const validationResult = TransactionsPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateTransactionsParams: (param) => {
    const validationResult = TransactionsParamsSchema.validate(param);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = TransactionsValidator;

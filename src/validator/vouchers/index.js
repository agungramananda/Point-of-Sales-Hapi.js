const InvariantError = require("../../exceptions/InvariantError");
const {
  vouchersPayloadSchema,
  vouchersQuerySchema,
  vouchersParamsSchema,
  redeemVouchersSchema,
} = require("./schema");

const VouchersValidator = {
  validateVouchersPayload: (payload) => {
    const validationResult = vouchersPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateVouchersQuery: (query) => {
    const validationResult = vouchersQuerySchema.validate(query);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateVouchersParams: (params) => {
    const validationResult = vouchersParamsSchema.validate(params);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateRedeemVouchers: (payload) => {
    const validationResult = redeemVouchersSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = VouchersValidator;

const InvariantError = require("../../exceptions/InvariantError");
const {
  SupplierParamsSchema,
  SupplierPayloadSchema,
  SupplierQuerySchema,
} = require("./schema");

const SupplierValidator = {
  validateSupplierParams: (params) => {
    const validationResult = SupplierParamsSchema.validate(params);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateSupplierPayload: (payload) => {
    const validationResult = SupplierPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateSupplierQuery: (query) => {
    const validationResult = SupplierQuerySchema.validate(query);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SupplierValidator;

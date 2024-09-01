const InvariantError = require("../../exceptions/InvariantError");
const {
  RolesPayloadSchema,
  RolesParamsSchema,
  RolesQuerySchema,
} = require("./schema");

const RolesValidator = {
  validateRolePayload: (payload) => {
    const validationResult = RolesPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateRoleParams: (params) => {
    const validationResult = RolesParamsSchema.validate(params);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateRoleQuery: (query) => {
    const validationResult = RolesQuerySchema.validate(query);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = RolesValidator;

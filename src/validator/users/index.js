const InvariantError = require("../../exceptions/InvariantError");
const {
  UsersPayloadSchema,
  UsersParamsSchema,
  UsersQuerySchema,
} = require("./schema");

const UsersValidator = {
  validateUsersPayload: (payload) => {
    const validationResult = UsersPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUsersParams: (params) => {
    const validationResult = UsersParamsSchema.validate(params);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUsersQuery: (query) => {
    const validationResult = UsersQuerySchema.validate(query);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UsersValidator;

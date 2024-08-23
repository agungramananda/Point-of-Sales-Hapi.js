const InvariantError = require("../../exceptions/InvariantError");
const { UsersPayloadSchema, UsersParamsSchema } = require("./schema");

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
};

module.exports = UsersValidator;

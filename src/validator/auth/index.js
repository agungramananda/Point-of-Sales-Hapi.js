const AuthenticationError = require("../../exceptions/AuthenticationError");
const { AuthPayloadSchema } = require("./schema");

const AuthValidator = {
  validateAuthPayload: (payload) => {
    const validationResult = AuthPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new AuthenticationError(validationResult.error.message);
    }
  },
};

module.exports = AuthValidator;

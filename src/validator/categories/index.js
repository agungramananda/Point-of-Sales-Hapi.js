const InvariantError = require("../../exceptions/InvariantError");
const {
  CategoryPayloadSchema,
  CategoryParamSchema,
  CategoryQuerySchema,
} = require("./schema");

const CategoryValidator = {
  validateCategoryPayload: (payload) => {
    const { error } = CategoryPayloadSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.details[0].message);
    }
  },

  validateCategoryParam: (param) => {
    const validationResult = CategoryParamSchema.validate(param);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateCategoryQuery: (query) => {
    const validationResult = CategoryQuerySchema.validate(query);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CategoryValidator;

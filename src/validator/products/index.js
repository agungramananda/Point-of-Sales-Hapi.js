const InvariantError = require("../../exceptions/InvariantError");
const {
  ProductsPayloadSchema,
  ProductsParamsSchema,
  ProductSortQuerySchema,
  ProductsAddSchema,
  ProductsUpdateSchema,
} = require("./schema");

const ProductsValidator = {
  validateAddProduct: (payload) => {
    const validationResult = ProductsAddSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdateProduct: (payload) => {
    const validationResult = ProductsUpdateSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateProductsParams: (params) => {
    const validationResult = ProductsParamsSchema.validate(params);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateSortQuery: (query) => {
    const validationResult = ProductSortQuerySchema.validate(query);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ProductsValidator;

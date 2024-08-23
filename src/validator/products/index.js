const InvariantError = require("../../exceptions/InvariantError");
const {
  ProductsPayloadSchema,
  ProductsParamsSchema,
  ProductsEditStockSchema,
  ProductsEditPriceSchema,
  ProductSortQuerySchema,
} = require("./schema");

const ProductsValidator = {
  validateProductsPayload: (payload) => {
    const validationResult = ProductsPayloadSchema.validate(payload);

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
  validateEditStock: (payload) => {
    const validationResult = ProductsEditStockSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateEditPrice: (payload) => {
    const validationResult = ProductsEditPriceSchema.validate(payload);

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

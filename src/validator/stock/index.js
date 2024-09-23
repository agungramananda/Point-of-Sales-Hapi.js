const InvariantError = require("../../exceptions/InvariantError");
const {
  StockParamSchema,
  editStockSettigsSchema,
  StockQuerySchema,
} = require("./schema");

const StockValidator = {
  validateStockParams: (params) => {
    const validationResults = StockParamSchema.validate(params);
    if (validationResults.error) {
      throw new InvariantError(validationResults.error.message);
    }
  },
  validaateEditStockSettings: (payload) => {
    const validationResults = editStockSettigsSchema.validate(payload);
    if (validationResults.error) {
      throw new InvariantError(validationResults.error.message);
    }
  },
  validateStockQuery: (query) => {
    const validationResults = StockQuerySchema.validate(query);
    if (validationResults.error) {
      throw new InvariantError(validationResults.error.message);
    }
  },
};

module.exports = StockValidator;

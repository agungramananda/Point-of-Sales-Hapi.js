const {
  CustomerParamsSchema,
  CustomerQuerySchema,
  AddCustomerSchema,
  EditCustomerSchema,
  ExtendMembershipSchema,
} = require("./schema");

const CustomerValidator = {
  validateCustomerParams: (params) => {
    const validationResult = CustomerParamsSchema.validate(params);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
  validateCustomerQuery: (query) => {
    const validationResult = CustomerQuerySchema.validate(query);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
  validateAddCustomer: (payload) => {
    const validationResult = AddCustomerSchema.validate(payload);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
  validateEditCustomer: (payload) => {
    const validationResult = EditCustomerSchema.validate(payload);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
  validateExtendMembership: (payload) => {
    const validationResult = ExtendMembershipSchema.validate(payload);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
};

module.exports = CustomerValidator;

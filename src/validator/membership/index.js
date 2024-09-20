const { valid } = require("joi");
const {
  MembershipQuerySchema,
  MembershipPayloadSchema,
  MembershipParamsSchema,
  PointsRulesPayloadSchema,
} = require("./schema");

const MembershipValidator = {
  validateMembershipQuery: (query) => {
    const validationResult = MembershipQuerySchema.validate(query);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
  validateMembershipPayload: (payload) => {
    const validationResult = MembershipPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
  validateMembershipParams: (params) => {
    const validationResult = MembershipParamsSchema.validate(params);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
  validatePointsRulesPayload: (payload) => {
    const validationResult = PointsRulesPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }
  },
};

module.exports = MembershipValidator;

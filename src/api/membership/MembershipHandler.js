const autoBind = require("auto-bind");

class MembershipHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getMembershipHandler(request, h) {
    this._validator.validateMembershipQuery(request.query);
    const { membership_category, page, limit } = request.query;
    const { data, infoPage } = await this._service.getMembership({
      membership_category,
      page,
      limit,
    });
    return h
      .response({
        status: "success",
        data,
        infoPage,
      })
      .code(200);
  }

  async getMembershipByIDHadler(request, h) {
    this._validator.validateMembershipParams(request.params);
    const { id } = request.params;
    const data = await this._service.getMembershipById(id);
    return h
      .response({
        status: "success",
        data,
      })
      .code(200);
  }

  async postMembershipHandler(request, h) {
    this._validator.validateMembershipPayload(request.payload);
    const { membership_category, level, min_point } = request.payload;
    const membershipId = await this._service.addMembership({
      membership_category,
      level,
      min_point,
    });
    return h
      .response({
        status: "success",
        message: "Membership berhasil ditambahkan",
        data: {
          membershipId,
        },
      })
      .code(201);
  }

  async putMembershipHandler(request, h) {
    this._validator.validateMembershipParams(request.params);
    this._validator.validateMembershipPayload(request.payload);
    const { id } = request.params;
    const { membership_category, level, min_point } = request.payload;
    await this._service.editMembership(id, {
      membership_category,
      level,
      min_point,
    });
    return h
      .response({
        status: "success",
        message: "Membership berhasil diperbarui",
      })
      .code(200);
  }

  async deleteMembershipHandler(request, h) {
    this._validator.validateMembershipParams(request.params);
    const { id } = request.params;
    await this._service.deleteMembership(id);
    return h
      .response({
        status: "success",
        message: "Membership berhasil dihapus",
      })
      .code(200);
  }

  async getPointsRulesHandler(_, h) {
    const data = await this._service.getPointsRules();
    return h
      .response({
        status: "success",
        data,
      })
      .code(200);
  }

  async putPointsRulesHandler(request, h) {
    this._validator.validatePointsRulesPayload(request.payload);
    const { min_amount_of_transaction, amount_of_spent, points } =
      request.payload;
    await this._service.editPointsRules({
      amount_of_transaction,
      points,
    });
    return h
      .response({
        status: "success",
        message: "Points Rules berhasil diperbarui",
      })
      .code(200);
  }
}

module.exports = MembershipHandler;

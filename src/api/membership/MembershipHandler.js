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
    const { membership_category, price, duration, percentage_discount } =
      request.payload;
    const membershipId = await this._service.addMembership({
      membership_category,
      price,
      duration,
      percentage_discount,
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
    const { membership_category, price, duration, percentage_discount } =
      request.payload;
    await this._service.editMembership(id, {
      membership_category,
      price,
      duration,
      percentage_discount,
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
}

module.exports = MembershipHandler;

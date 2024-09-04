const routes = (handler) => [
  {
    method: "POST",
    path: "/memberships",
    handler: handler.postMembershipHandler,
    config: {
      plugins: {
        rbac: ["CREATE_MEMBER"],
      },
    },
  },
  {
    method: "GET",
    path: "/memberships",
    handler: handler.getMembershipHandler,
    config: {
      plugins: {
        rbac: ["READ_MEMBER"],
      },
    },
  },
  {
    method: "GET",
    path: "/memberships/{id}",
    handler: handler.getMembershipByIDHadler,
    config: {
      plugins: {
        rbac: ["READ_MEMBER"],
      },
    },
  },
  {
    method: "PUT",
    path: "/memberships/{id}",
    handler: handler.putMembershipHandler,
    config: {
      plugins: {
        rbac: ["UPDATE_MEMBER"],
      },
    },
  },
  {
    method: "DELETE",
    path: "/memberships/{id}",
    handler: handler.deleteMembershipHandler,
    config: {
      plugins: {
        rbac: ["DELETE_MEMBER"],
      },
    },
  },
];
module.exports = routes;

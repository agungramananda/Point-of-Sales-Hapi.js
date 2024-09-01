const routes = (handler) => [
  {
    method: "GET",
    path: "/roles",
    handler: handler.getRolesHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["READ_ROLE"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/roles/{id}",
    handler: handler.getRoleByIdHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["READ_ROLE"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/roles",
    handler: handler.postRoleHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["CREATE_ROLE"],
        },
      },
    },
  },
  {
    method: "PUT",
    path: "/roles/{id}",
    handler: handler.putRoleHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["UPDATE_ROLE"],
        },
      },
    },
  },
  {
    method: "DELETE",
    path: "/roles/{id}",
    handler: handler.deleteRoleHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["DELETE_ROLE"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/roles/permissions",
    handler: handler.getPermissionsHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["READ_ROLE"],
        },
      },
    },
  },
];

module.exports = routes;

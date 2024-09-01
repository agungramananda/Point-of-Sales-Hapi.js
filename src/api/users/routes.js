const rbac = require("../../plugins/rbac");

const routes = (handler) => [
  {
    method: "GET",
    path: "/users",
    handler: handler.getUsersHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["READ_USER"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/users/{id}",
    handler: handler.getUserByIDHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["READ_USER"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/users",
    handler: handler.postUserHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["CREATE_USER"],
        },
      },
    },
  },
  {
    method: "PUT",
    path: "/users/{id}",
    handler: handler.putUserByIDHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["UPDATE_USER"],
        },
      },
    },
  },
  {
    method: "DELETE",
    path: "/users/{id}",
    handler: handler.deleteUserByIDHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["DELETE_USER"],
        },
      },
    },
  },
];

module.exports = routes;

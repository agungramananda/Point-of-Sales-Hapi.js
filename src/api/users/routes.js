const routes = (handler) => [
  {
    method: "GET",
    path: "/users",
    handler: handler.getUsersHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["ACCESS_TO_USER"],
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
        hacli: {
          permissions: ["ACCESS_TO_USER"],
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
        hacli: {
          permissions: ["ACCESS_TO_USER"],
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
        hacli: {
          permissions: ["ACCESS_TO_USER"],
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
        hacli: {
          permissions: ["ACCESS_TO_USER"],
        },
      },
    },
  },
];

module.exports = routes;

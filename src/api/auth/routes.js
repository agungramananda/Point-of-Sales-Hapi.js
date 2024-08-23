const routes = (handler) => [
  {
    method: "POST",
    path: "/authentication",
    handler: handler.postAuthHandler,
    config: {
      auth: false,
    },
  },
  {
    method: "PUT",
    path: "/authentication",
    handler: handler.putAuthHandler,
    config: {
      auth: false,
    },
  },
  {
    method: "DELETE",
    path: "/authentication",
    handler: handler.deleteAuthHandler,
    config: {
      auth: false,
    },
  },
];

module.exports = routes;

const routes = (handler) => [
  {
    method: "GET",
    path: "/notifications",
    handler: handler.getNotificationsHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["READ_PRODUCT"],
        },
      },
    },
  },
];

module.exports = routes;

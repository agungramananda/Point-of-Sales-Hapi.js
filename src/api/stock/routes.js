const routes = (handler) => [
  {
    method: "PUT",
    path: "/stock/{id}",
    handler: handler.putStockSettingsHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["UPDATE_PRODUCT"],
        },
      },
    },
  },
];

module.exports = routes;

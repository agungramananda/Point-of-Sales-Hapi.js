const routes = (handler) => [
  {
    method: "GET",
    path: "/stock",
    handler: handler.getStocksHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["READ_PRODUCT"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/stock/{id}",
    handler: handler.getStockByIDHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["READ_PRODUCT"],
        },
      },
    },
  },
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

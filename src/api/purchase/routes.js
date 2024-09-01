const routes = (handler) => [
  {
    method: "GET",
    path: "/purchase",
    handler: handler.getAllPurchaseHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["READ_PURCHASE"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/purchase/{id}",
    handler: handler.getPurchaseByIDHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["READ_PURCHASE"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/purchase",
    handler: handler.postPurchaseHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["CREATE_PURCHASE"],
        },
      },
    },
  },
];

module.exports = routes;

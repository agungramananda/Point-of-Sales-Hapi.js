const routes = (handler) => [
  {
    method: "GET",
    path: "/purchase",
    handler: handler.getAllPurchaseHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CAN_GET_PURCHASE"],
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
        hacli: {
          permissions: ["CAN_GET_PURCHASE"],
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
        hacli: {
          permissions: ["CAN_INSERT_PURCHASE"],
        },
      },
    },
  },
];

module.exports = routes;

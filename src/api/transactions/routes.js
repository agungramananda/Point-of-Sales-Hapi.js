const routes = (handler) => [
  {
    method: "GET",
    path: "/transactions/list",
    handler: handler.getTransactionsHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CAN_GET_TRANSACTION"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/transactions/list/{id}",
    handler: handler.getTransactionDetailsHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CAN_GET_TRANSACTION"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/transactions",
    handler: handler.postTransactionHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CAN_MAKE_TRANSACTION"],
        },
      },
    },
  },
];

module.exports = routes;

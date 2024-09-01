const rbac = require("../../plugins/rbac");

const routes = (handler) => [
  {
    method: "GET",
    path: "/transactions/list",
    handler: handler.getTransactionsHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["READ_TRANSACTION"],
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
        rbac: {
          permission: ["READ_TRANSACTION"],
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
        rbac: {
          permissions: ["CREATE_TRANSACTION"],
        },
      },
    },
  },
];

module.exports = routes;

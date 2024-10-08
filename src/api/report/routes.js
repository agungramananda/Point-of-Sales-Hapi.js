const routes = (handler) => [
  {
    method: "GET",
    path: "/report/sales",
    handler: handler.getSalesReportHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["GET_REPORT"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/report/purchase",
    handler: handler.getPurchaseReportHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["GET_REPORT"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/report/stock-movement",
    handler: handler.getStockReportHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["GET_REPORT"],
        },
      },
    },
  },
];

module.exports = routes;

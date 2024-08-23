const routes = (handler) => [
  {
    method: "GET",
    path: "/report/sales",
    handler: handler.getSalesReportHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CAN_GET_REPORT"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/report/sales",
    handler: handler.postSalesReportHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CAN_MAKE_SALES_REPORT"],
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
        hacli: {
          permissions: ["CAN_GET_REPORT"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/report/purchase",
    handler: handler.postPurchaseReportHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CAN_MAKE_PURCHASE_REPORT"],
        },
      },
    },
  },
  /*
  {
    method: "GET",
    path: "/report/product-sales",
    handler: handler.getProductSalesReportHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CAN_GET_REPORT"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/report/product-sales",
    handler: handler.postProductSalesReportHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CAN_MAKE_SALES_REPORT"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/report/product-purchase",
    handler: handler.getProductPurchaseReportHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CAN_GET_REPORT"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/report/product-purchase",
    handler: handler.postProductPurchaseReportHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CAN_MAKE_PURCHASE_REPORT"],
        },
      },
    },
  },
  */
];

module.exports = routes;

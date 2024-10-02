const routes = (handler) => [
  {
    method: "GET",
    path: "/purchase",
    handler: handler.getPurchaseHandler,
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
    handler: handler.getPurchaseDetailsByPurchaseIdHandler,
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
    handler: handler.addPurchaseHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["CREATE_PURCHASE"],
        },
      },
    },
  },
  {
    method: "PUT",
    path: "/purchase/{id}",
    handler: handler.editPurchaseHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["UPDATE_PURCHASE"],
        },
      },
    },
  },
  {
    method: "PUT",
    path: "/purchase/details/{id}",
    handler: handler.editPurchaseDetailsHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["UPDATE_PURCHASE"],
        },
      },
    },
  },
  {
    method: "PUT",
    path: "/purchase/complete/{id}",
    handler: handler.completePurchaseHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["UPDATE_PURCHASE"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/purchase/status",
    handler: handler.getPurchaseStatusHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["READ_PURCHASE"],
        },
      },
    },
  },
];

module.exports = routes;

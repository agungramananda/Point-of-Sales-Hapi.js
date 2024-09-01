const routes = (handler) => [
  {
    method: "GET",
    path: "/products",
    handler: handler.getProductsHandler,
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
    path: "/products/{id}",
    handler: handler.getProductByIDHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["READ_PRODUCT"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/products",
    handler: handler.postProductHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["CREATE_PRODUCT"],
        },
      },
    },
  },
  {
    method: "PUT",
    path: "/products/{id}",
    handler: handler.putProductByIDHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["UPDATE_PRODUCT"],
        },
      },
    },
  },
  {
    method: "DELETE",
    path: "/products/{id}",
    handler: handler.deleteProductByIDHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["DELETE_PRODUCT"],
        },
      },
    },
  },
  {
    method: "PUT",
    path: "/products/stock/{id}",
    handler: handler.editStockHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["UPDATE_PRODUCT"],
        },
      },
    },
  },
  {
    method: "PUT",
    path: "/products/price/{id}",
    handler: handler.editPriceHandler,
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

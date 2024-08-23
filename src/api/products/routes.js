const routes = (handler) => [
  {
    method: "GET",
    path: "/products",
    handler: handler.getProductsHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CAN_GET_PRODUCT"],
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
        hacli: {
          permissions: ["CAN_GET_PRODUCT"],
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
        hacli: {
          permissions: ["CAN_INSERT_PRODUCT"],
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
        hacli: {
          permissions: ["CAN_EDIT_PRODUCT"],
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
        hacli: {
          permissions: ["CAN_DELETE_PRODUCT"],
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
        hacli: {
          permissions: ["CAN_EDIT_PRODUCT"],
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
        hacli: {
          permissions: ["CAN_EDIT_PRODUCT"],
        },
      },
    },
  },
];

module.exports = routes;

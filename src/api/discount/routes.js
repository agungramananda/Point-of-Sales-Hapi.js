const routes = (handler) => [
  {
    method: "GET",
    path: "/discounts",
    handler: handler.getDiscountsHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["READ_DISCOUNT"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/discounts/{id}",
    handler: handler.getDiscountByIDHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["READ_DISCOUNT"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/discounts",
    handler: handler.postDiscountHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["CREATE_DISCOUNT"],
        },
      },
    },
  },
  {
    method: "PUT",
    path: "/discounts/{id}",
    handler: handler.editDiscountHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["UPDATE_DISCOUNT"],
        },
      },
    },
  },
  {
    method: "DELETE",
    path: "/discounts/{id}",
    handler: handler.deleteDiscountHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["DELETE_DISCOUNT"],
        },
      },
    },
  },
];

module.exports = routes;

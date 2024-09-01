const routes = (handler) => [
  {
    method: "POST",
    path: "/categories",
    handler: handler.postCategoryHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["CREATE_CATEGORY"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/categories",
    handler: handler.getCategoriesHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["READ_CATEGORY"],
        },
      },
    },
  },
  {
    method: "PUT",
    path: "/categories/{id}",
    handler: handler.putCategoryByIdHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["UPDATE_CATEGORY"],
        },
      },
    },
  },
  {
    method: "DELETE",
    path: "/categories/{id}",
    handler: handler.deleteCategoryByIdHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["DELETE_CATEGORY"],
        },
      },
    },
  },
];

module.exports = routes;

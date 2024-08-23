const routes = (handler) => [
  {
    method: "POST",
    path: "/categories",
    handler: handler.postCategoryHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CRUD_CATEGORY"],
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
        hacli: {
          permissions: ["CRUD_CATEGORY"],
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
        hacli: {
          permissions: ["CRUD_CATEGORY"],
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
        hacli: {
          permissions: ["CRUD_CATEGORY"],
        },
      },
    },
  },
];

module.exports = routes;

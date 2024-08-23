const routes = (handler) => [
  {
    method: "GET",
    path: "/suppliers",
    handler: handler.getSuppliersHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CRUD_SUPPLIER"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/suppliers/{id}",
    handler: handler.getSupplierByIDHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CRUD_SUPPLIER"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/suppliers",
    handler: handler.postSupplierHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CRUD_SUPPLIER"],
        },
      },
    },
  },
  {
    method: "PUT",
    path: "/suppliers/{id}",
    handler: handler.putSupplierByIDHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CRUD_SUPPLIER"],
        },
      },
    },
  },
  {
    method: "DELETE",
    path: "/suppliers/{id}",
    handler: handler.deleteSupplierByIDHandler,
    config: {
      plugins: {
        hacli: {
          permissions: ["CRUD_SUPPLIER"],
        },
      },
    },
  },
];

module.exports = routes;

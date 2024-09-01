const routes = (handler) => [
  {
    method: "GET",
    path: "/suppliers",
    handler: handler.getSuppliersHandler,
    config: {
      plugins: {
        rbac: {
          permission: ["READ_SUPPLIER"],
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
        rbac: {
          permission: ["READ_SUPPLIER"],
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
        rbac: {
          permission: ["CREATE_SUPPLIER"],
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
        rbac: {
          permission: ["UPDATE_SUPPLIER"],
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
        rbac: {
          permission: ["DELETE_SUPPLIER"],
        },
      },
    },
  },
];

module.exports = routes;

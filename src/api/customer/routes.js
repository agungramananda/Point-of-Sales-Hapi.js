const routes = (handler) => [
  {
    method: "POST",
    path: "/customer",
    handler: handler.postCustomerHandler,
    config: {
      plugins: {
        rbac: ["CREATE_CUSTOMER"],
      },
    },
  },
  {
    method: "GET",
    path: "/customer",
    handler: handler.getCustomersHandler,
    config: {
      plugins: {
        rbac: ["READ_CUSTOMER"],
      },
    },
  },
  {
    method: "GET",
    path: "/customer/{id}",
    handler: handler.getCustomerByIdHandler,
    config: {
      plugins: {
        rbac: ["READ_CUSTOMER"],
      },
    },
  },
  {
    method: "PUT",
    path: "/customer/{id}",
    handler: handler.putCustomerHandler,
    config: {
      plugins: {
        rbac: ["UPDATE_CUSTOMER"],
      },
    },
  },
  {
    method: "DELETE",
    path: "/customer/{id}",
    handler: handler.deleteCustomerHandler,
    config: {
      plugins: {
        rbac: ["DELETE_CUSTOMER"],
      },
    },
  },
  {
    method: "PUT",
    path: "/customer/{id}/extend",
    handler: handler.extendMembershipHandler,
    config: {
      plugins: {
        rbac: ["UPDATE_CUSTOMER"],
      },
    },
  },
];

module.exports = routes;

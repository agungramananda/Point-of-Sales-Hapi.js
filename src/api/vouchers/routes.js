const routes = (handler) => [
  {
    method: "GET",
    path: "/vouchers",
    handler: handler.getVouchersHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["GET_DISCOUNT"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/vouchers/{id}",
    handler: handler.getVoucherByIdHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["GET_DISCOUNT"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/vouchers",
    handler: handler.postVoucherHandler,
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
    path: "/vouchers/{id}",
    handler: handler.editVoucherHandler,
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
    path: "/vouchers/{id}",
    handler: handler.deleteVoucherHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["DELETE_DISCOUNT"],
        },
      },
    },
  },
  {
    method: "POST",
    path: "/vouchers/redeem",
    handler: handler.redeemPoinToVoucherHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["CREATE_DISCOUNT"],
        },
      },
    },
  },
  {
    method: "GET",
    path: "/customer/{id}/vouchers",
    handler: handler.getCustomerVouchersHandler,
    config: {
      plugins: {
        rbac: {
          permissions: ["GET_DISCOUNT"],
        },
      },
    },
  },
];

module.exports = routes;

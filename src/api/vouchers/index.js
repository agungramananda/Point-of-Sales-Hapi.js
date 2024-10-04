const routes = require("./routes");
const VoucherHandler = require("./VoucherHandler");

module.exports = {
  name: "Vouchers",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const vouchersHandler = new VoucherHandler(service, validator);
    server.route(routes(vouchersHandler));
  },
};

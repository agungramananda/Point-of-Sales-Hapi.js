const routes = require("./routes");
const VoucherHandler = require("./VoucherHandler");

module.exports = {
  name: "Vouchers",
  version: "1.0.0",
  register: async (server, { service }) => {
    const vouchersHandler = new VoucherHandler(service);
    server.route(routes(vouchersHandler));
  },
};

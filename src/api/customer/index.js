const CustomerHandler = require("./CustomerHandler");
const routes = require("./routes");

module.exports = {
  name: "customer",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const customerHandler = new CustomerHandler(service, validator);
    server.route(routes(customerHandler));
  },
};

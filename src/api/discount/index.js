const DiscountHandler = require("./DiscountHandler");
const routes = require("./routes");

module.exports = {
  name: "discount",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const discountHandler = new DiscountHandler(service, validator);
    server.route(routes(discountHandler));
  },
};

const PurchaseHandler = require("./PurchaseHandler");
const routes = require("./routes");

module.exports = {
  name: "purchase",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const purchaseHandler = new PurchaseHandler(service, validator);
    server.route(routes(purchaseHandler));
  },
};

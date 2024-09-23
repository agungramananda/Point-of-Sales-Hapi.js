const routes = require("./routes");
const StockHandler = require("./StockHandler");

module.exports = {
  name: "stock",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const stockHandler = new StockHandler(service, validator);
    server.route(routes(stockHandler));
  },
};

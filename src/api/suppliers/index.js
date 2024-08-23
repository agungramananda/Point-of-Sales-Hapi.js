const routes = require("./routes");
const SuppliersHandler = require("./SuppliersHandler");

module.exports = {
  name: "suppliers",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const suppliersHandler = new SuppliersHandler(service, validator);
    server.route(routes(suppliersHandler));
  },
};

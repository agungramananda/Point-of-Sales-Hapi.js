const RolesHandler = require("./RolesHandler");
const routes = require("./routes");

module.exports = {
  name: "roles",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const rolesHandler = new RolesHandler(service, validator);
    server.route(routes(rolesHandler));
  },
};

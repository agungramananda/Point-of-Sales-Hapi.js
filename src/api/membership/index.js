const MembershipHandler = require("./MembershipHandler");
const routes = require("./routes");

module.exports = {
  name: "membership",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const membershipHandler = new MembershipHandler(service, validator);
    server.route(routes(membershipHandler));
  },
};

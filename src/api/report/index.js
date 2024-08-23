const ReportHandler = require("./ReportHandler");
const routes = require("./routes");

module.exports = {
  name: "report",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const reportHandler = new ReportHandler(service, validator);
    server.route(routes(reportHandler));
  },
};

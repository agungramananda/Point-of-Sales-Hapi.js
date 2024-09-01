const { verifyPermission } = require("./verifyPermission");

module.exports = {
  name: "rbacPlugin",
  version: "1.0.0",
  register: async (server, options) => {
    const { validPermissions } = options;

    if (!validPermissions || !Array.isArray(validPermissions)) {
      console.error("Valid permissions array is required for RBAC plugin");
      process.exit(1);
    }

    server.app.validPermissions = validPermissions;

    server.decorate("request", "hasPermissions", async function (permission) {
      const { permission: userPermission } = this.auth.credentials;

      if (!server.app.validPermissions?.includes(permission)) {
        console.error(`Invalid Permission: ${permission}`);
        process.exit(1);
      }

      await verifyPermission(userPermission, permission);
    });

    server.ext("onPreHandler", async (request, h) => {
      const routePermissions =
        request.route.settings.plugins.rbac?.permission || [];

      if (routePermissions.length === 0) {
        return h.continue;
      }
      for (const permission of routePermissions) {
        await request.hasPermissions(permission);
      }
      return h.continue;
    });
  },
};

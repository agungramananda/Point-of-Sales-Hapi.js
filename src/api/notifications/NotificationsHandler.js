const autoBind = require("auto-bind");

class NotificationsHandler {
  constructor(service) {
    this._service = service;
    autoBind(this);
  }

  async getNotificationsHandler(_, h) {
    const notifications = await this._service.getNotifications();
    return h.response({
      status: "success",
      data: {
        notifications,
      },
    });
  }
}

module.exports = NotificationsHandler;

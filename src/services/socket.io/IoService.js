const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

class IoService {
  constructor(redisService) {
    this._io = null;
    this._redisService = redisService;
  }

  async init(server) {
    this._io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    this._pubClient = createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });
    const subClient = this._pubClient.duplicate();

    await this._pubClient.connect();
    await subClient.connect();

    this._io.adapter(createAdapter(this._pubClient, subClient));

    this._io.on("connection", (socket) => {
      socket.join("notifications");

      socket.on("error", (err) => {
        console.error("Socket error:", err);
      });
    });

    this._io.on("error", (err) => {
      console.error("Socket.IO error:", err);
    });

    subClient.subscribe("notifications", (message) => {
      const notification = JSON.parse(message);
      this._io.to("notifications").emit("notification", notification);
    });

    subClient.on("error", (err) => {
      console.error("Error:", err);
    });

    console.log("Socket.IO server is running");
  }

  getIo() {
    return this._io;
  }

  async sendNotification(notification) {
    try {
      await this._redisService.saveNotification(notification);
      this._pubClient.publish("notifications", JSON.stringify(notification));
    } catch (err) {
      throw new Error(err);
    }
  }

  logConnectedClients() {
    const clients = this._io.sockets.sockets;
    console.log("Connected clients:");
    clients.forEach((socket) => {
      console.log(`Client ID: ${socket.id}`);
    });
  }
}

module.exports = IoService;

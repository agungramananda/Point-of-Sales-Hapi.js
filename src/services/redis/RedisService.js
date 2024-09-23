const { createClient } = require("redis");
const { v4: uuidv4 } = require("uuid");

class RedisService {
  constructor() {
    this._client = createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });

    this._client.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
    this._client.on("connect", () => {
      console.log("Connected to Redis");
    });

    this._connect();
  }

  async _connect() {
    try {
      await this._client.connect();
    } catch (err) {
      console.error("Error connecting to Redis:", err);
    }
  }

  getClient() {
    return this._client;
  }

  async saveNotification(notification) {
    const id = `notification:${uuidv4()}`;
    notification.id = id;
    try {
      await this._client.hSet(id, notification);
      await this._client.expire(id, 7 * 24 * 60 * 60); // Set expiration to 7 days
    } catch (err) {
      console.error("Error saving notification to Redis:", err);
    }
  }

  async getNotifications() {
    try {
      const keys = await this._client.keys("notification:*");
      const notifications = await Promise.all(
        keys.map(async (key) => {
          return await this._client.hGetAll(key);
        })
      );

      return notifications;
    } catch (err) {
      console.error("Error getting notifications from Redis:", err);
    }
  }
}

module.exports = RedisService;

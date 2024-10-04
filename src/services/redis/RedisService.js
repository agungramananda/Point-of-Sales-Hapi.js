const { createClient } = require("redis");
const { v4: uuidv4 } = require("uuid");
const InvariantError = require("../../exceptions/InvariantError");

class RedisService {
  constructor() {
    this._client = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
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
    try {
      await this._client.HSET(notification.id, {
        title: notification.title,
        message: notification.message,
      });
      await this._client.expire(notification.id, 7 * 24 * 60 * 60); // Set expiration to 7 days
    } catch (err) {
      console.error("Error saving notification to Redis:", err);
    }
  }

  async getNotifications() {
    try {
      const keys = await this._client.keys("notification*");
      const notifications = await Promise.all(
        keys.map((key) => this._client.hGetAll(key))
      );
      return notifications;
    } catch (err) {
      throw new InvariantError(err);
    }
  }

  async getNotificationById(id) {
    try {
      const notification = await this._client.keys(id);
      return notification;
    } catch (err) {
      throw new InvariantError(err);
    }
  }
}

module.exports = RedisService;

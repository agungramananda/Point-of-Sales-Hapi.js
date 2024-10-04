/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("transactions", {
    id: "id",
    user_id: {
      type: "INT",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    total_items: {
      type: "INT",
      notNull: true,
    },
    total_price: {
      type: "INT",
      notNull: true,
    },
    payment: {
      type: "INT",
      notNull: true,
    },
    change: {
      type: "INT",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("transactions", "user_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("transactions", "user_id");
  pgm.dropTable("transactions");
};

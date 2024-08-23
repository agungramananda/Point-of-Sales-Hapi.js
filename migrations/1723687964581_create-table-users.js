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
  pgm.createTable("users", {
    id: "id",
    username: {
      type: "VARCHAR(255)",
      notNull: true,
    },
    password: {
      type: "VARCHAR(100)",
      notNull: true,
    },
    name: {
      type: "TEXT",
      notNull: true,
    },
    status: {
      type: "INT",
      notNull: true,
      default: 1,
    },
    role_id: {
      type: "INT",
      notNull: true,
      references: "roles",
      onDelete: "RESTRICT",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    deleted_at: {
      type: "timestamp",
      notNull: false,
      default: null,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("users");
};

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
  pgm.createTable("customer", {
    id: "id",
    name: {
      type: "varchar(100)",
      notNull: true,
    },
    email: {
      type: "varchar(100)",
      notNull: true,
    },
    phone_number: {
      type: "varchar(100)",
      notNull: true,
    },
    address: {
      type: "text",
      notNull: true,
    },
    points: {
      type: "int",
      notNull: true,
    },
    membership_id: {
      type: "int",
      notNull: true,
      references: "membership",
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
    deleted_at: { type: "timestamp" },
  });

  pgm.createIndex("customer", "email");
  pgm.createIndex("customer", "name");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("customer", "name");
  pgm.dropIndex("customer", "email");
  pgm.dropTable("customer");
};

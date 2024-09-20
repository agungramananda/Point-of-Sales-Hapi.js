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
  pgm.createTable("coupons", {
    id: "id",
    code: {
      type: "varchar(100)",
      notNull: true,
    },
    discount: {
      type: "int",
      notNull: true,
    },
    expired_date: {
      type: "timestamp",
      notNull: true,
    },
    membership_id: {
      type: "int",
      notNull: true,
      references: "membership",
      onDelete: "CASCADE",
    },
    start_date: {
      type: "timestamp",
      notNull: true,
    },
    end_date: {
      type: "timestamp",
      notNull: true,
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
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("coupons");
};

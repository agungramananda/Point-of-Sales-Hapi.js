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
  pgm.createTable("membership_transaction", {
    id: "id",
    user_id: {
      type: "int",
      notNull: true,
      references: "users",
    },
    customer_id: {
      type: "int",
      notNull: true,
      references: "customer",
    },
    membership_id: {
      type: "int",
      notNull: true,
      references: "membership",
    },
    price: {
      type: "int",
      notNull: true,
    },
    start_date: {
      type: "timestamp",
      notNull: true,
    },
    end_date: {
      type: "timestamp",
      notNull: true,
    },
    note: {
      type: "text",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("membership_transaction");
};

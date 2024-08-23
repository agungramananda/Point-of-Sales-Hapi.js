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
  pgm.createTable("transaction_details", {
    id: "id",
    transaction_id: {
      type: "INT",
      notNull: true,
      references: '"transactions"',
      onDelete: "CASCADE",
    },
    product_id: {
      type: "INT",
      notNull: true,
      references: '"products"',
      onDelete: "RESTRICT",
    },
    product_price: {
      type: "INT",
      notNull: true,
    },
    quantity: {
      type: "INT",
      notNull: true,
    },
    total_price: {
      type: "INT",
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
  pgm.dropTable("transaction_details");
};

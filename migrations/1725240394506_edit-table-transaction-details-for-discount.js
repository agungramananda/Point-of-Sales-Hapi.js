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
  pgm.addColumn("transactions", {
    total_discount: {
      type: "int",
      notNull: true,
      default: 0,
    },
  });

  pgm.addColumn("transactions", {
    subtotal: {
      type: "int",
      notNull: true,
      default: 0,
    },
  });

  pgm.addColumn("transaction_details", {
    subtotal: {
      type: "int",
      notNull: true,
      default: 0,
    },
  });
  pgm.addColumn("transaction_details", {
    total_discount: {
      type: "int",
      notNull: true,
      default: 0,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropColumns("transactions", ["total_discount", "subtotal"]);
  pgm.dropColumns("transaction_details", ["total_discount", "subtotal"]);
};

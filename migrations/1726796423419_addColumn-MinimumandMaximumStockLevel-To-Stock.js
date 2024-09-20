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
  pgm.addColumn("stock", {
    minimum_stock_level: {
      type: "integer",
      notNull: true,
      default: 0,
    },
    maximum_stock_level: {
      type: "integer",
      notNull: true,
      default: 0,
    },
    reorder_point: {
      type: "integer",
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
  pgm.dropColumns("stock", [
    "minimum_stock_level",
    "maximum_stock_level",
    "reorder_point",
  ]);
};

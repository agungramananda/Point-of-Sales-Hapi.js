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
  pgm.createTable("stock", {
    product_id: {
      type: "INT",
      notNull: true,
      unique: true,
      references: '"products"',
      onDelete: "CASCADE",
      primaryKey: true,
    },
    amount: { type: "INT", notNull: true },
    safety_stock: { type: "INT", notNull: true, default: 0 },
    maximum_stock: { type: "INT", notNull: true, default: 0 },
    updated_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("stock", "product_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("stock", "product_id");
  pgm.dropTable("stock");
};

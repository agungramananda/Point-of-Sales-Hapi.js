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
  pgm.createTable("product_discount", {
    id: "id",
    product_id: {
      type: "int",
      notNull: true,
      references: "products",
      onDelete: "CASCADE",
    },
    discount_id: {
      type: "int",
      notNull: true,
      references: "discount",
      onDelete: "CASCADE",
    },
    discount_value: {
      type: "int",
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

  pgm.createIndex("product_discount", ["product_id"]);
  pgm.createIndex("product_discount", ["discount_id"]);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("product_discount", ["product_id"]);
  pgm.dropIndex("product_discount", ["discount_id"]);
  pgm.dropTable("product_discount");
};

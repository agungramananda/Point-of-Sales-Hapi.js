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
  pgm.createTable("products", {
    id: "id",
    product_name: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    price: {
      type: "INT",
      notNull: true,
    },
    category_id: {
      type: "INT",
      notNull: true,
      references: "categories",
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

  pgm.createIndex("products", "product_name");
  pgm.createIndex("products", "category_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("products", "category_id");
  pgm.dropIndex("products", "product_name");
  pgm.dropTable("products");
};

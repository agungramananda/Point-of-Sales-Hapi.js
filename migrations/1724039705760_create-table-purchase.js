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
  pgm.createTable("purchase", {
    id: "id",
    supplier_id: {
      type: "INT",
      notNull: true,
      references: "suppliers",
    },
    product_id: {
      type: "INT",
      notNull: true,
      references: "products",
    },
    quantity: {
      type: "INT",
      notNull: true,
    },
    price: {
      type: "bigint",
      notNull: true,
    },
    total_price: {
      type: "bigint",
      notNull: true,
    },
    expiry_date: {
      type: "timestamp",
    },
    remaining_stock: {
      type: "INT",
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
    deleted_at: {
      type: "timestamp",
      notNull: false,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("purchase");
};

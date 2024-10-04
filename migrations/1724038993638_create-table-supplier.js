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
  pgm.createTable("suppliers", {
    id: "id",
    supplier_name: {
      type: "VARCHAR(100)",
      notNull: true,
    },
    contact: {
      type: "VARCHAR(100)",
      notNull: true,
    },
    address: {
      type: "VARCHAR(255)",
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
      default: null,
    },
  });

  pgm.createIndex("suppliers", "supplier_name");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("suppliers", "supplier_name");
  pgm.dropTable("suppliers");
};

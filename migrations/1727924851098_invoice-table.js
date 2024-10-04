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
  pgm.createTable("invoice", {
    id: "id",
    transaction_id: {
      type: "INT",
      notNull: true,
      references: '"transactions"',
    },
    invoice_number: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    customer_id: {
      type: "INT",
      notNull: false,
      references: '"customer"',
    },
    items: {
      type: "JSON",
      notNull: true,
    },
    sub_total: {
      type: "DECIMAL",
      notNull: true,
    },
    discount: {
      type: "DECIMAL",
      notNull: true,
    },
    total: {
      type: "DECIMAL",
      notNull: true,
    },
    payment: {
      type: "DECIMAL",
      notNull: true,
    },
    change: {
      type: "DECIMAL",
      notNull: true,
    },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    deleted_at: {
      type: "TIMESTAMP",
      notNull: false,
    },
  });

  pgm.createIndex("invoice", "transaction_id");
  pgm.createIndex("invoice", "customer_id");
  pgm.createIndex("invoice", "invoice_number");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("invoice", "transaction_id");
  pgm.dropIndex("invoice", "customer_id");
  pgm.dropIndex("invoice", "invoice_number");
  pgm.dropTable("invoice");
};

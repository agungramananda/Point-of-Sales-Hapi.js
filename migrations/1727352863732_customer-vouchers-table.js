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
  pgm.createTable("customer_vouchers", {
    id: "id",
    customer_id: {
      type: "INT",
      notNull: true,
      references: "customer",
      onDelete: "CASCADE",
    },
    voucher_id: {
      type: "INT",
      notNull: true,
      references: "vouchers",
      onDelete: "CASCADE",
    },
    is_used: {
      type: "BOOLEAN",
      notNull: true,
      default: false,
    },
    expiry_date: {
      type: "TIMESTAMP",
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
    },
  });

  pgm.createIndex("customer_vouchers", ["customer_id", "voucher_id"]);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("customer_vouchers", ["customer_id", "voucher_id"]);
  pgm.dropTable("customer_vouchers");
};

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
    voucher_id: {
      type: "INT",
      notNull: false,
      references: "vouchers",
      onDelete: "CASCADE",
    },
    voucher_discount: {
      type: "INT",
      notNull: false,
    },
    points_used: {
      type: "INT",
      notNull: false,
    },
  });

  pgm.createIndex("transactions", "voucher_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("transactions", "voucher_id");
  pgm.dropColumn("transactions", "voucher_id");
};

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
  pgm.createTable("vouchers", {
    id: "id",
    code: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    membership_id: {
      type: "INT",
      notNull: true,
      references: "membership",
    },
    point_cost: {
      type: "INT",
      notNull: true,
    },
    discount_value: {
      type: "INT",
      notNull: true,
    },
    discount_type_id: {
      type: "INT",
      notNull: true,
      references: "discount_type",
    },
    min_transaction: {
      type: "INT",
      notNull: true,
    },
    max_discount: {
      type: "INT",
      notNull: true,
    },
    start_date: {
      type: "TIMESTAMP",
      notNull: true,
    },
    end_date: {
      type: "TIMESTAMP",
      notNull: true,
    },
    validity_period: {
      type: "INT",
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
      default: null,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("vouchers");
};

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
  pgm.createTable("stockmovement", {
    id: "id",
    product_id: {
      type: "integer",
      notNull: true,
      references: "products",
      onDelete: "CASCADE",
    },
    movement_type: {
      type: "text",
      notNull: true,
    },
    quantity_change: {
      type: "integer",
      notNull: true,
    },
    references_id: {
      type: "integer",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("stockmovement", "product_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("stockmovement", "product_id");
  pgm.dropTable("stockmovement");
};

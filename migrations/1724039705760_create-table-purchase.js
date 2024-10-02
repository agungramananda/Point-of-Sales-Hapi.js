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
  pgm.createTable("purchase_status", {
    id: "id",
    status: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });

  pgm.sql(
    `INSERT INTO purchase_status(status) VALUES ('pending'), ('complete'), ('return')`
  );
  pgm.createTable("purchase", {
    id: "id",
    supplier_id: {
      type: "INT",
      notNull: true,
      references: "suppliers",
      onDelete: "CASCADE",
    },
    purchase_date: {
      type: "TIMESTAMP",
      notNull: true,
    },
    total_cost: {
      type: "INT",
      notNull: true,
    },
    status_id: {
      type: "INT",
      notNull: true,
      references: "purchase_status",
    },
    received_date: {
      type: "TIMESTAMP",
      notNull: false,
      default: null,
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

  pgm.createTable("purchase_details", {
    id: "id",
    purchase_id: {
      type: "INT",
      notNull: true,
      references: "purchase",
      onDelete: "CASCADE",
    },
    product_id: {
      type: "INT",
      notNull: true,
      references: "products",
      onDelete: "CASCADE",
    },
    quantity: {
      type: "INT",
      notNull: true,
    },
    cost: {
      type: "INT",
      notNull: true,
    },
    expiry_date: {
      type: "TIMESTAMP",
      notNull: false,
    },
    remaining_stock: {
      type: "INT",
      notNull: true,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("purchase_details");
  pgm.dropTable("purchase");
  pgm.dropTable("purchase_status");
};

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
  pgm.createTable("sales_summary", {
    id: "id",
    transaction_date: {
      type: "DATE",
      notNull: true,
      unique: true,
    },
    total_income: {
      type: "BIGINT",
      notNull: true,
    },
    total_transaction: {
      type: "INT",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  /*
  pgm.createTable("product_sales_summary", {
    id: "id",
    product_id: {
      type: "INT",
      notNull: true,
      references: "products",
    },
    amount: {
      type: "INT",
      notNull: true,
    },
    total_income: {
      type: "BIGINT",
      notNull: true,
    },
    month: {
      type: "INT",
      notNull: true,
    },
    year: {
      type: "INT",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createTable("product_purchase_summary", {
    id: "id",
    product_id: {
      type: "INT",
      notNull: true,
      references: "products",
    },
    quantity: {
      type: "INT",
      notNull: true,
    },
    total_price: {
      type: "BIGINT",
      notNull: true,
    },
    month: {
      type: "INT",
      notNull: true,
    },
    year: {
      type: "INT",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
  */

  pgm.createTable("purchase_summary", {
    id: "id",
    total_price: {
      type: "BIGINT",
      notNull: true,
    },
    total_product: {
      type: "INT",
      notNull: true,
    },
    purchase_date: {
      type: "DATE",
      notNull: true,
      unique: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("sales_summary");
  pgm.dropTable("purchase_summary");
  /*
  pgm.dropTable("product_sales_summary");
  pgm.dropTable("product_purchase_summary");
  */
};

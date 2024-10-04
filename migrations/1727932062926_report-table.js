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
  pgm.createTable("sales_report", {
    id: "id",
    product_name: { type: "text", notNull: true },
    total_sales: { type: "integer", notNull: true },
    total_income: { type: "numeric", notNull: true },
    report_date: { type: "date", notNull: true },
  });

  pgm.createTable("purchase_report", {
    id: "id",
    product_name: { type: "text", notNull: true },
    total_purchase: { type: "integer", notNull: true },
    total_expense: { type: "numeric", notNull: true },
    report_date: { type: "date", notNull: true },
  });

  pgm.createIndex("sales_report", "report_date");
  pgm.createIndex("purchase_report", "report_date");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("sales_report");
  pgm.dropTable("purchase_report");
};

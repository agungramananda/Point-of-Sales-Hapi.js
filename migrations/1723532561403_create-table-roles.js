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
  pgm.createTable("roles", {
    id: "id",
    role: {
      type: "VARCHAR(50)",
      notNull: true,
      unique: true,
    },
  });

  pgm.sql(
    "INSERT INTO roles (role) VALUES ('ADMIN'),('CASHIER'), ('WAREHOUSE'),('MANAGER')"
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("roles");
};

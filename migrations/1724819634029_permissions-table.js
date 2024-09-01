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
  pgm.createTable("permissions", {
    id: "id",
    permission: {
      type: "TEXT",
      notNull: true,
    },
  });
  pgm.sql(
    `INSERT INTO permissions (permission) VALUES 
    ('CREATE_PRODUCT'), ('READ_PRODUCT'), ('UPDATE_PRODUCT'), ('DELETE_PRODUCT'),
    ('CREATE_CATEGORY'), ('READ_CATEGORY'), ('UPDATE_CATEGORY'), ('DELETE_CATEGORY'),
    ('CREATE_USER'), ('READ_USER'), ('UPDATE_USER'), ('DELETE_USER'),
    ('CREATE_ROLE'), ('READ_ROLE'), ('UPDATE_ROLE'), ('DELETE_ROLE'),
    ('CREATE_SUPPLIER'), ('READ_SUPPLIER'), ('UPDATE_SUPPLIER'), ('DELETE_SUPPLIER'),
    ('CREATE_TRANSACTION'), ('READ_TRANSACTION'), ('CREATE_PURCHASE'), ('READ_PURCHASE'),
    ('CREATE_DISCOUNT'), ('READ_DISCOUNT'), ('UPDATE_DISCOUNT'), ('DELETE_DISCOUNT'),
    ('CREATE_CUSTOMER'), ('READ_CUSTOMER'), ('UPDATE_CUSTOMER'), ('DELETE_CUSTOMER'),
    ('CREATE_MEMBER'), ('READ_MEMBER'), ('UPDATE_MEMBER'), ('DELETE_MEMBER'),
    ('GET_REPORT')`
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("permissions");
};

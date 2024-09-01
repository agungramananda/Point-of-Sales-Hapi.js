/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = async (pgm) => {
  pgm.sql("insert into roles (role) values('Admin')");
  pgm.sql(
    "insert into role_permissions (role_id, permission_id) select 1, id from permissions"
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql("delete from role_permissions where role_id = '1'");
  pgm.sql("delete from roles where role = 'Admin'");
};

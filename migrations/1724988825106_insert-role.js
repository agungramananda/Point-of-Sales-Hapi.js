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

  pgm.sql(`
  insert into role_permissions (role_id, permission_id)
  select r.id, p.id
  from roles r, permissions p
  where r.role = 'Admin'
`);

  pgm.sql("insert into roles (role) values('Kasir')");

  pgm.sql(`
  insert into role_permissions (role_id, permission_id)
  select r.id, p.id
  from roles r, permissions p
  where r.role = 'Kasir' 
  and p.id IN (2, 21, 22, 26, 29, 30, 31, 32, 34)
`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql("delete from roles where role = 'Admin'");
  pgm.sql("delete from roles where role = 'Kasir'");
};

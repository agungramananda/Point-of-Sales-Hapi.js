const bcrypt = require("bcrypt");
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
  const hashedPassword = await bcrypt.hash("admin123", 10);

  pgm.db.query(
    `insert into users (username, password, name, role_id)
     values('admin1', $1, 'Ucup', 
     (select id from roles where role = 'Admin'))`,
    [hashedPassword]
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql("delete from users where username = 'admin1'");
};

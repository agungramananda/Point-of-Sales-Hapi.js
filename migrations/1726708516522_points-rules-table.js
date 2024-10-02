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
  pgm.createTable("points_rules", {
    id: "id",
    min_amount_of_transaction: {
      type: "INT",
      notNull: true,
    },
    amount_of_spent: {
      type: "INT",
      notNull: true,
    },
    points: {
      type: "INT",
      notNull: true,
    },
    points_usage: {
      type: "INT",
      notNull: true,
      //0 for balance and 1 for redeem voucher
    },
  });

  pgm.sql(
    `insert into points_rules(min_amount_of_transaction,amount_of_spent, points,points_usage) values (0,1000, 1,0)`
  );
};

exports.down = (pgm) => {
  pgm.dropTable("points_rules");
};

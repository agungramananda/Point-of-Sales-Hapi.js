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
  });

  pgm.sql(
    `insert into points_rules(min_amount_of_transaction,amount_of_spent, points) values (0,1000, 1)`
  );
};

exports.down = (pgm) => {
  pgm.dropTable("points_rules");
};

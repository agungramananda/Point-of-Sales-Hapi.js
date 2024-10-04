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
  pgm.createTable("discount_type", {
    id: "id",
    type_name: { type: "varchar(1000)", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    deleted_at: { type: "timestamp" },
  });

  pgm.sql(`
    insert into discount_type (type_name) values ('Percentage'), ('Fixed');
  `);

  pgm.createTable("discount", {
    id: "id",
    discount_code: { type: "varchar(1000)", notNull: true },
    discount_type_id: {
      type: "int",
      notNull: true,
      references: "discount_type",
    },
    description: { type: "text" },
    start_date: { type: "date", notNull: true },
    end_date: { type: "date", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    deleted_at: { type: "timestamp" },
  });

  pgm.createIndex("discount", "discount_code");
  pgm.createIndex("discount", "discount_type_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("discount", "discount_type_id");
  pgm.dropIndex("discount", "discount_code");
  pgm.dropTable("discount");
  pgm.dropTable("discount_type");
};

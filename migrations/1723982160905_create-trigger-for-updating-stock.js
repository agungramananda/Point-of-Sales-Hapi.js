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
  pgm.createFunction(
    "reduce_stock",
    [],
    {
      returns: "trigger",
      language: "plpgsql",
    },
    `
    BEGIN
    UPDATE stock
    SET amount = amount - NEW.quantity
    WHERE product_id = NEW.product_id;

    RETURN NEW;
    END;
  `
  );
  pgm.createTrigger(
    "transaction_details",
    "reduce_stock_after_insert_transaction",
    {
      when: "AFTER",
      operation: "INSERT",
      function: "reduce_stock",
      level: "ROW",
    }
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTrigger(
    "transaction_details",
    "reduce_stock_after_insert_transaction"
  );
  pgm.dropFunction("reduce_stock", []);
};

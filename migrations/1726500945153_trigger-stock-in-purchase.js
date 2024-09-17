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
    "reduce_remaining_stock_in_purchase",
    [],
    {
      returns: "trigger",
      language: "plpgsql",
    },
    `
    BEGIN
      UPDATE purchase
      SET remaining_stock = remaining_stock - NEW.quantity
      WHERE product_id = NEW.product_id
      AND id = (
        SELECT id
        FROM purchase
        WHERE product_id = NEW.product_id
        ORDER BY created_at ASC
        LIMIT 1
      );

      RETURN NEW;
    END;
    `
  );

  pgm.createTrigger(
    "transaction_details",
    "reduce_remaining_stock_after_insert_transaction_in_purchase",
    {
      when: "AFTER",
      operation: "INSERT",
      function: "reduce_remaining_stock_in_purchase",
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
    "reduce_remaining_stock_after_insert_transaction_in_purchase"
  );
  pgm.dropFunction("reduce_remaining_stock_in_purchase");
};

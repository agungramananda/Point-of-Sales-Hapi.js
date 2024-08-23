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
    "add_stock_after_purchase",
    [],
    {
      returns: "trigger",
      language: "plpgsql",
    },
    `
    BEGIN
      UPDATE stock
      SET amount = amount + NEW.quantity
      WHERE product_id = NEW.product_id;

      RETURN NEW;
    END;
    `
  );

  pgm.createTrigger("purchase", "add_stock_after_purchase_trigger", {
    when: "AFTER",
    operation: "INSERT",
    function: "add_stock_after_purchase",
    level: "ROW",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTrigger("purchase", "add_stock_after_purchase_trigger");
  pgm.dropFunction("add_stock_after_purchase", []);
};

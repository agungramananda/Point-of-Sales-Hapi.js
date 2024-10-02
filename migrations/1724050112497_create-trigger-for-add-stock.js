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
      DECLARE
      purchase_detail RECORD;
      BEGIN
      IF NEW.status_id = 2 THEN
        FOR purchase_detail IN
          SELECT product_id, quantity FROM purchase_details WHERE purchase_id = NEW.id
        LOOP
          UPDATE stock
          SET amount = amount + purchase_detail.quantity
          WHERE product_id = purchase_detail.product_id;
        END LOOP;
      END IF;
      RETURN NEW;
    END;
    `
  );

  pgm.createTrigger("purchase", "add_stock_after_purchase_trigger", {
    when: "AFTER",
    operation: ["INSERT", "UPDATE"],
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

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
    "log_to_stockmovement",
    [],
    {
      returns: "trigger",
      language: "plpgsql",
    },
    `
    DECLARE
      purchase_detail RECORD;
    BEGIN
      IF (TG_TABLE_NAME = 'purchase') THEN
        IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
          IF (NEW.status_id = 2) THEN
            FOR purchase_detail IN
              SELECT product_id, quantity FROM purchase_details WHERE purchase_id = NEW.id
            LOOP
              INSERT INTO stockmovement(product_id, movement_type, quantity_change, references_id)
              VALUES(purchase_detail.product_id, 'PURCHASE', purchase_detail.quantity, NEW.id);
            END LOOP;
          ELSIF (NEW.status_id = 3 AND OLD.status_id = 2) THEN
            FOR purchase_detail IN
              SELECT product_id, quantity FROM purchase_details WHERE purchase_id = NEW.id
            LOOP
              INSERT INTO stockmovement(product_id, movement_type, quantity_change, references_id)
              VALUES(purchase_detail.product_id, 'RETURN', purchase_detail.quantity, NEW.id);
            END LOOP;
          END IF;
        END IF;
      ELSIF (TG_TABLE_NAME = 'transaction_details') THEN
        INSERT INTO stockmovement(product_id, movement_type, quantity_change, references_id)
        VALUES(NEW.product_id, 'TRANSACTION', NEW.quantity, NEW.transaction_id);
      END IF;
      RETURN NEW;
    END;
    `
  );

  pgm.createTrigger("purchase", "stock_movement_trigger_in", {
    when: "AFTER",
    operation: ["INSERT", "UPDATE"],
    function: "log_to_stockmovement",
    level: "ROW",
  });

  pgm.createTrigger("transaction_details", "stock_movement_trigger_out", {
    when: "AFTER",
    operation: "INSERT",
    function: "log_to_stockmovement",
    level: "ROW",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTrigger("purchase", "stock_movement_trigger_in");

  pgm.dropTrigger("transaction_details", "stock_movement_trigger_out");

  pgm.dropFunction("log_to_stockmovement", []);
};

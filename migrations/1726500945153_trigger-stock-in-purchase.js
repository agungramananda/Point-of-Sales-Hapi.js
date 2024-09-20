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
    DECLARE
      remaining_quantity INTEGER := NEW.quantity;
      purchase_id INTEGER;
      purchase_remaining_stock INTEGER;
    BEGIN
      FOR purchase_id, purchase_remaining_stock IN
        SELECT id, remaining_stock
        FROM purchase
        WHERE product_id = NEW.product_id AND remaining_stock > 0
        ORDER BY created_at ASC
      LOOP
        IF remaining_quantity <= purchase_remaining_stock THEN
          UPDATE purchase
          SET remaining_stock = remaining_stock - remaining_quantity
          WHERE id = purchase_id;
          remaining_quantity := 0;
          EXIT;
        ELSE
          UPDATE purchase
          SET remaining_stock = 0
          WHERE id = purchase_id;
          remaining_quantity := remaining_quantity - purchase_remaining_stock;
        END IF;
      END LOOP;

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

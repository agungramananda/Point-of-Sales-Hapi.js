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
      p_id INTEGER;
      purchase_remaining_stock INTEGER;
    BEGIN
      FOR p_id, purchase_remaining_stock IN
        SELECT pd.id, pd.remaining_stock, p.status_id
        FROM purchase_details pd
        LEFT JOIN purchase p ON pd.purchase_id = p.id
        WHERE pd.product_id = NEW.product_id AND pd.remaining_stock > 0 and p.status_id = 2
        ORDER BY created_at ASC
      LOOP
        IF remaining_quantity <= purchase_remaining_stock THEN
          UPDATE purchase_details
          SET remaining_stock = remaining_stock - remaining_quantity
          WHERE id = p_id;
          remaining_quantity := 0;
          EXIT;
        ELSE
          UPDATE purchase_details
          SET remaining_stock = 0
          WHERE id = p_id;
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

const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { beetwenDate } = require("../../utils/betweenDate");
const calculatePercentageDiscount = require("../../utils/calculatePercentageDiscount");
const { addCustomerPoints } = require("../../utils/customerPointsManager");
const { v4: uuidv4 } = require("uuid");

class TransactionsService {
  constructor(
    productsService,
    usersService,
    customersService,
    membershipsService,
    voucherService,
    ioService,
    redisService
  ) {
    this._productsService = productsService;
    this._usersService = usersService;
    this._customersService = customersService;
    this._membershipsService = membershipsService;
    this._voucherService = voucherService;
    this._pool = new Pool();
    this._ioService = ioService;
    this._redisService = redisService;
  }

  async getTransactions({ startDate, endDate, page, limit }) {
    let query = `SELECT t.id, t.user_id, t.customer_id, t.total_items, t.subtotal, t.total_discount, t.voucher_id, 
    t.voucher_discount, t.points_used, t.total_price, t.payment, t.change, t.created_at AS transaction_date
    FROM transactions t WHERE t.created_at IS NOT NULL`;

    query = beetwenDate(startDate, endDate, "created_at", query);
    const p = pagination({ limit, page });
    const page_info = await getMaxPage(p, query);

    const sql = {
      text: `${query} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      values: [p.limit, p.offset],
    };

    try {
      const result = await this._pool.query(sql);
      return { data: result.rows, page_info };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getTransactionDetails(id) {
    const query = {
      text: `select i.invoice_number , i.customer_id , i.items , i.sub_total , i.discount, i.total , i.payment , i."change" 
      from invoice i 
      WHERE i.transaction_id = $1`,
      values: [id],
    };

    try {
      const result = await this._pool.query(query);
      if (result.rows.length === 0) {
        throw new NotFoundError("Transaction not found");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addTransaction({
    user_id,
    customer_id,
    items,
    payment,
    voucher,
    points_used,
  }) {
    //items = [{product_id, quantity}]

    try {
      await this._pool.query("BEGIN");

      await this._validateUser(user_id);

      const products = await this._processItems(items);

      let { total_price, total_items, total_discount, subtotal } =
        this._calculateTotals(products);
      let voucher_discount = 0;

      if (customer_id) {
        const customer = await this._customersService.getCustomerById(
          customer_id
        );
        ({ total_discount, total_price, voucher_discount } =
          await this._applyVoucherOrPoints(
            voucher,
            points_used,
            total_price,
            total_discount,
            customer,
            customer_id
          ));
      }

      this._validatePayment(payment, total_price);

      const change = payment - total_price;

      const transaction = await this._insertTransaction({
        user_id,
        customer_id,
        total_items,
        subtotal,
        total_discount,
        total_price,
        payment,
        change,
        voucher,
        voucher_discount,
        points_used,
      });

      await this._insertTransactionDetails(transaction.id, products);

      const invoice = await this._insertInvoice({
        transaction_id: transaction.id,
        customer_id,
        items: products,
        sub_total: subtotal,
        discount: total_discount,
        total: total_price,
        payment,
        change,
      });

      for (const product of products) {
        await this._insertReport({
          product_name: product.product_name,
          quantity: product.quantity,
          total_price: product.total_product_price,
          transaction_date: transaction.created_at,
        });
      }

      await this._Notify(products);

      await this._pool.query("COMMIT");
      return invoice;
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async _validateUser(user_id) {
    try {
      await this._usersService.getUserByID(user_id);
    } catch (error) {
      throw new InvariantError("Invalid user ID");
    }
  }

  async _processItems(items) {
    const products = [];

    for (const item of items) {
      await this._productsService.getProductByID(item.product_id);

      const productData = await this._fetchProductData(item.product_id);
      if (item.quantity > productData.amount) {
        throw new InvariantError(
          `Insufficient stock for product ${productData.product_name}, remaining stock ${productData.amount}.`
        );
      }

      const { id, product_name, price, discounts } = productData;
      if (discounts[0] == null) {
        products.push({
          product_id: id,
          product_name,
          product_price: price,
          quantity: item.quantity,
          subtotal_product: price * item.quantity,
          total_product_discount: 0,
          total_product_price: price * item.quantity,
        });
        continue;
      }
      const { total_discount, total_price } =
        await this._calculateProductDiscount(price, discounts, item.quantity);

      products.push({
        product_id: id,
        product_name,
        product_price: price,
        quantity: item.quantity,
        subtotal_product: price * item.quantity,
        total_product_discount: total_discount,
        total_product_price: total_price,
      });
    }

    return products;
  }

  async _fetchProductData(product_id) {
    const query = {
      text: `SELECT p.id, p.product_name, p.price, s.amount, 
      array_agg(pd.discount_id) as discounts 
      FROM products p 
      JOIN stock s ON p.id = s.product_id 
      LEFT JOIN product_discount pd ON p.id = pd.product_id 
      WHERE p.id = $1 AND p.deleted_at IS NULL 
      GROUP BY p.id, s.amount`,
      values: [product_id],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async _calculateProductDiscount(price, discounts, quantity) {
    let total_discount = 0;

    for (const discount_id of discounts) {
      const discount = await this._fetchDiscountById(discount_id);
      if (discount.type_name === "Percentage") {
        total_discount += calculatePercentageDiscount(
          price,
          discount.discount_value
        );
      } else {
        total_discount += discount.discount_value;
      }
    }

    total_discount *= quantity;
    total_discount = Math.min(total_discount, price * quantity);
    return {
      total_discount,
      total_price: price * quantity - total_discount,
    };
  }

  async _applyVoucherOrPoints(
    voucher,
    points_used,
    total_price,
    total_discount,
    customer,
    customer_id
  ) {
    if (voucher && points_used) {
      throw new InvariantError(
        "Cannot use both voucher and points at the same time"
      );
    }

    let voucher_discount = 0;

    if (voucher) {
      voucher_discount = await this._applyVoucher(
        voucher,
        total_price,
        total_discount,
        customer_id
      );
    } else if (points_used) {
      await this._applyPoints(
        customer,
        points_used,
        total_price,
        total_discount
      );
    }

    return { total_discount, total_price, voucher_discount };
  }

  _validatePayment(payment, total_price) {
    if (payment < total_price) {
      throw new InvariantError(
        "Customer's payment is insufficient, total price is " +
          total_price +
          " but customer only pay " +
          payment
      );
    }
  }

  _calculateTotals(products) {
    let total_price = 0;
    let total_items = 0;
    let total_discount = 0;
    let subtotal = 0;

    for (const product of products) {
      total_price += product.total_product_price;
      total_items += product.quantity;
      total_discount += product.total_product_discount;
      subtotal += product.subtotal_product;
    }

    return { total_price, total_items, total_discount, subtotal };
  }

  async _fetchDiscountById(discount_id) {
    const query = {
      text: `
      select pd.discount_value, dt. type_name
      from product_discount pd 
      left join discount d on d.id = pd.discount_id 
      left join discount_type dt on dt.id = d.discount_type_id 
      WHERE d.id = $1`,
      values: [discount_id],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async _insertTransaction({
    user_id,
    customer_id,
    total_items,
    subtotal,
    total_discount,
    total_price,
    payment,
    change,
    voucher,
    voucher_discount,
    points_used,
  }) {
    const query = {
      text: `
      INSERT INTO transactions 
      (user_id, customer_id, total_items, subtotal, total_discount, total_price, payment, change, voucher_id, voucher_discount, points_used)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, created_at`,
      values: [
        user_id,
        customer_id,
        total_items,
        subtotal,
        total_discount,
        total_price,
        payment,
        change,
        voucher
          ? await this._voucherService.getVoucherByCode(voucher).id
          : null,
        voucher_discount,
        points_used || null,
      ],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async _insertTransactionDetails(transaction_id, products) {
    const queries = products.map((product) => ({
      text: `
      INSERT INTO transaction_details 
      (transaction_id, product_id, product_price, quantity, total_price, subtotal, total_discount)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      values: [
        transaction_id,
        product.product_id,
        product.product_price,
        product.quantity,
        product.total_product_price,
        product.subtotal_product,
        product.total_product_discount,
      ],
    }));

    for (const query of queries) {
      await this._pool.query(query);
    }
  }

  async _insertInvoice({
    transaction_id,
    customer_id,
    items,
    sub_total,
    discount,
    total,
    payment,
    change,
  }) {
    const invoice_id = `INV-${Date.now()}-${uuidv4().split("-")[0]}`;
    const query = {
      text: `
      INSERT INTO invoice 
      (invoice_number, transaction_id, customer_id, items, sub_total, discount, total, payment, change)
      VALUES ($1,$2, $3, $4, $5, $6, $7, $8, $9) RETURNING invoice_number, transaction_id, customer_id, items, sub_total, discount, total, payment, change`,
      values: [
        invoice_id,
        transaction_id,
        customer_id ? customer_id : null,
        JSON.stringify(items),
        sub_total,
        discount ? discount : 0,
        total,
        payment,
        change,
      ],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async _checkReport(product_name, transaction_date) {
    const query = {
      text: `SELECT id FROM sales_report WHERE product_name = $1 AND report_date = $2`,
      values: [product_name, transaction_date],
    };
    try {
      const result = await this._pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
  async _insertReport({
    product_name,
    quantity,
    total_price,
    transaction_date,
  }) {
    const checkReport = await this._checkReport(product_name, transaction_date);
    if (checkReport) {
      const query = {
        text: `UPDATE sales_report SET total_sales = total_sales + $1, total_income = total_income + $2 WHERE product_name = $3 AND report_date = $4`,
        values: [quantity, total_price, product_name, transaction_date],
      };
      await this._pool.query(query);
    } else {
      const query = {
        text: `INSERT INTO sales_report (product_name, total_sales, total_income, report_date) VALUES ($1, $2, $3, $4)`,
        values: [product_name, quantity, total_price, transaction_date],
      };
      await this._pool.query(query);
    }
  }

  async _Notify(products) {
    for (const product of products) {
      const stockQuery = {
        text: `SELECT s.amount, s.safety_stock FROM stock s WHERE s.product_id = $1`,
        values: [product.product_id],
      };
      const stockResult = await this._pool.query(stockQuery);
      const { amount, safety_stock } = stockResult.rows[0];

      if (amount <= safety_stock) {
        const id = `notification-${new Date().toISOString().split("T")[0]}-${
          product.product_id
        }`;
        const checkNotification = await this._redisService.getNotificationById(
          id
        );
        if (checkNotification.length > 0) {
          continue;
        }
        const notification = {
          id,
          title: "Low Stock Alert",
          message: `Stock for product ID ${product.product_id} ${product.product_name} has reached the minimum threshold of ${safety_stock}. Current stock: ${amount}.`,
        };
        this._ioService.sendNotification(notification);
      }
    }
  }

  async _checkPointsUsageRule() {
    const rules = await this._membershipsService.getPointsRules();
    if (rules.points_usage === "Direct Discount") {
      return "Direct Discount";
    } else {
      return "Redeem Voucher";
    }
  }

  async _applyVoucher(voucher, total_price, total_discount, customer_id) {
    const pointsUsageRule = await this._checkPointsUsageRule();
    if (pointsUsageRule === "Direct Discount") {
      throw new InvariantError(
        "Cannot use voucher because transactions use points for direct discount"
      );
    }
    const voucherData = await this._voucherService.getVoucherByCode(voucher);
    if (voucherData.min_transaction > total_price) {
      throw new InvariantError(
        `Voucher can only be used for transactions over ${voucherData.min_transaction}. Your total is ${total_price}.`
      );
    }

    const customerVoucher = await this._voucherService.checkCustomerVoucher({
      customer_id,
      voucher_id: voucherData.id,
    });

    if (customerVoucher.expiry_date < new Date()) {
      throw new InvariantError("Voucher has expired");
    }

    let voucher_discount;
    if (voucherData.discount_type === "Percentage") {
      voucher_discount = calculatePercentageDiscount(
        total_price,
        voucherData.discount_value
      );
      voucher_discount = Math.min(voucher_discount, voucherData.max_discount);
    } else {
      voucher_discount = Math.min(
        voucherData.discount_value,
        voucherData.max_discount
      );
    }

    total_discount += voucher_discount;
    total_price -= voucher_discount;

    await this._voucherService.useVoucher({
      voucher_id: voucherData.id,
      customer_id,
    });

    return voucher_discount;
  }

  async _applyPoints(customer, points_used, total_price, total_discount) {
    const pointsUsageRule = await this._checkPointsUsageRule();
    if (pointsUsageRule === "Redeem Voucher") {
      throw new InvariantError(
        "Cannot use points for direct discount because transactions use voucher for discount"
      );
    }
    if (points_used > customer.points) {
      throw new InvariantError("You don't have enough points");
    }
    if (points_used > total_price) {
      throw new InvariantError("Points exceed total price");
    }

    total_discount += points_used;
    total_price -= points_used;

    await addCustomerPoints(this._pool, customer, -points_used);
  }
}

module.exports = TransactionsService;

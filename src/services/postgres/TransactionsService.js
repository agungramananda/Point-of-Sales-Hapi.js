const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { beetwenDate } = require("../../utils/betweenDate");
const calculatePercentageDiscount = require("../../utils/calculatePercentageDiscount");
const { addCustomerPoints } = require("../../utils/customerPointsManager");

class TransactionsService {
  constructor(
    productsService,
    usersService,
    customersService,
    membershipsService,
    voucherService,
    ioService
  ) {
    this._productsService = productsService;
    this._usersService = usersService;
    this._customersService = customersService;
    this._membershipsService = membershipsService;
    this._voucherService = voucherService;
    this._pool = new Pool();
    this._ioService = ioService;
  }

  async getTransactions({ startDate, endDate, page, limit }) {
    let query = `select
    t.id, t.user_id, t.customer_id,t.total_items , t.subtotal , t.total_discount ,t.voucher_id, t.voucher_discount, t.points_used, t.total_price , t.payment , t."change" , t.created_at as transaction_date
    from transactions t where t.created_at is not null`;
    query = beetwenDate(startDate, endDate, "created_at", query);
    const p = pagination({ limit, page });
    const infoPage = await getMaxPage(p, query);
    const sql = {
      text: `${query} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      values: [p.limit, p.offset],
    };
    try {
      const result = await this._pool.query(sql);
      return { data: result.rows, infoPage };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getTransactionDetails(id) {
    const query = {
      text: `
      select 
      td.transaction_id ,td.product_id , td.product_price , td.quantity , td.subtotal , td.total_discount , td.total_price 
      from transaction_details td 
      WHERE transaction_id = $1`,
      values: [id],
    };
    try {
      const result = await this._pool.query(query);

      if (!result.rows[0]) {
        throw new NotFoundError("Transaksi tidak ada");
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
    const products = [];

    try {
      await this._usersService.getUserByID(user_id);
    } catch (error) {
      throw new InvariantError(error.message);
    }

    await this._pool.query("BEGIN");

    try {
      for (const item of items) {
        await this._productsService.getProductByID(item.product_id);
        const itemQuery = {
          text: `
          SELECT p.id, p.product_name, s.amount
          FROM products p
          JOIN stock s on p.id = s.product_id
          WHERE p.id = $1 AND deleted_at IS NULL
          FOR UPDATE
          `,
          values: [item.product_id],
        };
        const product = await this._pool.query(itemQuery);

        if (item.quantity > product.rows[0].amount) {
          throw new InvariantError(
            `Stok barang tidak cukup untuk produk ${product.rows[0].product_name}. Stok tersedia :${product.rows[0].amount}`
          );
        }
      }

      for (const item of items) {
        const productQuery = {
          text: `
          select p.id, p.price, array_agg(pd.discount_id) as discount_list 
          from products p 
          left join product_discount pd on p.id = pd.product_id 
          left join discount d on pd.discount_id = d.id and current_timestamp between d.start_date and d.end_date 
          where p.id = $1 
          group by p.id
          `,
          values: [item.product_id],
        };
        const result = await this._pool.query(productQuery);
        const { id, price, discount_list } = result.rows[0];

        if (discount_list[0] === null) {
          discount_list.pop();
        }
        let total_discount = 0;
        let subtotal = 0;
        let total_price = 0;
        if (discount_list.length > 0) {
          for (const discount_id of discount_list) {
            const discountQuery = {
              text: `
              select pd.discount_value, dt.type_name as discount_type
              from discount d 
              left join discount_type dt on d.discount_type_id = dt.id 
              left join product_discount pd on pd.discount_id = d.id
              where d.id = $1
              `,
              values: [discount_id],
            };
            const discount = await this._pool.query(discountQuery);
            if (discount.rows[0].discount_type == "Percentage") {
              total_discount += calculatePercentageDiscount(
                price,
                discount.rows[0].discount_value
              );
            } else {
              total_discount += discount.rows[0].discount_value;
            }
          }
          total_discount = total_discount * item.quantity;
        }
        subtotal = price * item.quantity;
        if (total_discount > subtotal) {
          total_discount = subtotal;
        }
        total_price = subtotal - total_discount;
        products.push({
          product_id: id,
          product_price: price,
          quantity: item.quantity,
          subtotal_product: price * item.quantity,
          total_product_discount: total_discount,
          total_product_price: total_price,
        });
      }

      let total_price = 0;
      let total_items = 0;
      let total_discount = 0;
      let subtotal = 0;
      let voucher_discount = 0;
      let points_discount = points_used ? points_used : null;

      for (const product of products) {
        total_price += product.total_product_price;
        total_items += product.quantity;
        total_discount += product.total_product_discount;
        subtotal += product.subtotal_product;
      }
      if (!customer_id && voucher) {
        throw new InvariantError("Voucher hanya bisa digunakan oleh customer");
      }
      if (customer_id && !voucher && points_used) {
        throw new InvariantError("Poin hanya bisa digunakan oleh customer");
      }
      if (voucher && points_used) {
        throw new InvariantError(
          "Voucher dan poin tidak bisa digunakan bersamaan"
        );
      }

      const v_id = voucher
        ? await this._voucherService.getVoucherByCode(voucher)
        : null;

      if (customer_id) {
        const customer = await this._customersService.getCustomerById(
          customer_id
        );
        const rules = await this._membershipsService.getPointsRules();
        if (rules.points_usage == "Redeem Voucher") {
          console.log(voucher);
          if (voucher) {
            const voucherData = await this._voucherService.getVoucherByCode(
              voucher
            );
            const customerVoucher =
              await this._voucherService.checkCustomerVoucher({
                customer_id: customer_id,
                voucher_id: voucherData.id,
              });
            console.log(customerVoucher);
            console.log(voucherData);
            if (voucherData.min_transaction > total_price) {
              throw new InvariantError(
                `Voucher hanya bisa digunakan untuk transaksi minimal ${voucherData.min_transaction} anda hanya membeli ${total_price}`
              );
            }
            if (customerVoucher.expiry_date < new Date()) {
              throw new InvariantError("Voucher sudah kadaluarsa");
            }
            if (voucherData.discount_type == "Percentage") {
              voucher_discount = calculatePercentageDiscount(
                total_price,
                voucherData.discount_value
              );
              if (voucher_discount > voucherData.max_discount) {
                voucher_discount = voucherData.max_discount;
              }
              total_discount += voucher_discount;
              total_price -= voucher_discount;
            } else {
              if (voucherData.discount_value > voucherData.max_discount) {
                voucherData.discount_value = voucherData.max_discount;
              }
              total_discount += voucherData.discount_value;
              total_price -= voucherData.discount_value;
            }
            await this._voucherService.useVoucher({
              voucher_id: voucherData.id,
              customer_id: customer_id,
            });
          }
        } else if (points_used) {
          if (points_used > customer.points) {
            throw new InvariantError(
              "Poin yang digunakan melebihi poin yang dimiliki"
            );
          }
          if (points_used > total_price) {
            throw new InvariantError(
              "Poin yang digunakan melebihi total harga"
            );
          }
          points_discount = points_used;
          total_discount += points_used;
          total_price -= points_used;
        }
        await addCustomerPoints(this._pool, customer, total_price);
      }

      if (payment < total_price) {
        throw new InvariantError("Uang yang diberikan customer tidak cukup");
      }

      const change = payment - total_price;

      const transactionsQuery = {
        text: `
        INSERT INTO transactions (user_id, customer_id, total_items, subtotal, total_discount,total_price, payment, change, voucher_id, voucher_discount, points_used)
        VALUES ($1,$2,$3,$4,$5, $6, $7, $8, $9, $10, $11) RETURNING id
        `,
        values: [
          user_id,
          customer_id,
          total_items,
          subtotal,
          total_discount,
          total_price,
          payment,
          change,
          v_id ? v_id.id : null,
          voucher_discount,
          points_discount,
        ],
      };

      const transactionResult = await this._pool.query(transactionsQuery);

      const transaction_id = parseInt(transactionResult.rows[0].id);

      for (const product of products) {
        const transactionDetailQuery = {
          text: `
          INSERT INTO transaction_details 
          (transaction_id, product_id, product_price, quantity, total_price, subtotal, total_discount)
          VALUES ($1,$2,$3,$4, $5,$6,$7)
          `,
          values: [
            transaction_id,
            product.product_id,
            product.product_price,
            product.quantity,
            product.total_product_price,
            product.subtotal_product,
            product.total_product_discount,
          ],
        };
        await this._pool.query(transactionDetailQuery);

        const stockQuery = {
          text: `SELECT s.amount, s.safety_stock FROM stock s WHERE s.product_id = $1`,
          values: [product.product_id],
        };
        const stockResult = await this._pool.query(stockQuery);
        const { amount, safety_stock } = stockResult.rows[0];

        if (amount <= safety_stock) {
          const notification = {
            title: "Low Stock Alert",
            message: `Stock produk dengan id ${product.product_id} sudah mencapai batas minimum yaitu ${safety_stock}. Stock sekarang ${amount}`,
          };
          this._ioService.sendNotification(notification);
        }
      }

      await this._pool.query("COMMIT");

      return [transactionResult.rows];
    } catch (error) {
      await this._pool.query("ROLLBACK");
      console.log(error);
      throw new InvariantError(error.message);
    }
  }
}

module.exports = TransactionsService;

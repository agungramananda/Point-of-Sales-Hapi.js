require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

const ClientError = require("./exceptions/ClientError");

const categories = require("./api/categories");
const CategoryValidator = require("./validator/categories");
const CategoriesService = require("./services/postgres/CategoriesService");

const products = require("./api/products");
const ProductsValidator = require("./validator/products");
const ProductsService = require("./services/postgres/ProductsService");

const users = require("./api/users");
const UsersValidator = require("./validator/users");
const UsersService = require("./services/postgres/UsersService");

const transactions = require("./api/transactions");
const TransactionsValidator = require("./validator/transactions");
const TransactionsService = require("./services/postgres/TransactionsService");

const suppliers = require("./api/suppliers");
const SupplierValidator = require("./validator/suppliers");
const SupplierService = require("./services/postgres/SupplierService");

const purchase = require("./api/purchase");
const PurchaseValidator = require("./validator/purchase");
const PurchaseService = require("./services/postgres/PurchaseService");

const report = require("./api/report");
const ReportValidator = require("./validator/report");
const ReportService = require("./services/postgres/ReportService");

const auth = require("./api/auth");
const AuthValidator = require("./validator/auth");
const AuthService = require("./services/postgres/AuthService");
const tokenManager = require("./utils/tokenManager");

const init = async () => {
  const categoriesService = new CategoriesService();
  const productsService = new ProductsService();
  const usersService = new UsersService();
  const transactionsService = new TransactionsService();
  const supplierService = new SupplierService();
  const purchaseService = new PurchaseService();
  const authService = new AuthService();
  const reportService = new ReportService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: require("@antoniogiordano/hacli"),
      options: {
        permissions: {
          ADMIN: {
            MANAGER: {
              CASHIER: {
                CAN_GET_PRODUCT: {},
                CAN_GET_TRANSACTION: {},
                CAN_MAKE_TRANSACTION: {},
                CAN_MAKE_SALES_REPORT: {},
              },
              WAREHOUSE: {
                CAN_GET_PRODUCT: {},
                CAN_INSERT_PRODUCT: {},
                CAN_EDIT_PRODUCT: {},
                CAN_DELETE_PRODUCT: {},
                CRUD_CATEGORY: {},
                CAN_GET_PURCHASE: {},
                CAN_INSERT_PURCHASE: {},
                CRUD_SUPPLIER: {},
                CAN_MAKE_PURCHASE_REPORT: {},
                CAN_GET_REPORT: {},
              },
              ACCOUNTING: {
                CAN_GET_REPORT: {},
              },
            },
            ACCESS_TO_USER: {},
          },
        },
      },
    },
  ]);

  server.auth.strategy("pos_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_SECRET,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 3600, //1 jam
    },
    validate: (artifact) => ({
      isValid: true,
      credentials: {
        id: artifact.decoded.payload.id,
        permission: artifact.decoded.payload.permission,
      },
    }),
  });

  server.auth.default("pos_jwt");

  await server.register([
    {
      plugin: categories,
      options: {
        service: categoriesService,
        validator: CategoryValidator,
      },
    },
    {
      plugin: products,
      options: {
        service: productsService,
        validator: ProductsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: transactions,
      options: {
        service: transactionsService,
        validator: TransactionsValidator,
      },
    },
    {
      plugin: suppliers,
      options: {
        service: supplierService,
        validator: SupplierValidator,
      },
    },
    {
      plugin: purchase,
      options: {
        service: purchaseService,
        validator: PurchaseValidator,
      },
    },
    {
      plugin: report,
      options: {
        service: reportService,
        validator: ReportValidator,
      },
    },
    {
      plugin: auth,
      options: {
        authService,
        usersService,
        tokenManager,
        validator: AuthValidator,
      },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        return h
          .response({
            status: "fail",
            message: response.message,
          })
          .code(response.statusCode);
      }

      if (!response.isServer) {
        return h.continue;
      }

      return h
        .response({
          status: "error",
          message: response.message,
        })
        .code(500);
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
};

init();

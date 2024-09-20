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

const roles = require("./api/roles");
const RolesValidator = require("./validator/roles");
const RolesService = require("./services/postgres/RolesService");

const discount = require("./api/discount");
const DiscountService = require("./services/postgres/DiscountService");
const DiscountValidator = require("./validator/discount");

const membership = require("./api/membership");
const MembershipService = require("./services/postgres/MembershipService");
const MembershipValidator = require("./validator/membership");

const customers = require("./api/customer");
const CustomerService = require("./services/postgres/CustomerService");
const CustomersValidator = require("./validator/customer");

const auth = require("./api/auth");
const AuthValidator = require("./validator/auth");
const AuthService = require("./services/postgres/AuthService");
const tokenManager = require("./utils/tokenManager");
const rbacPlugin = require("./plugins/rbac");

const init = async () => {
  const categoriesService = new CategoriesService();
  const productsService = new ProductsService();
  const usersService = new UsersService();
  const supplierService = new SupplierService();
  const purchaseService = new PurchaseService();
  const authService = new AuthService();
  const reportService = new ReportService();
  const rolesService = new RolesService();
  const discountService = new DiscountService();
  const membershipService = new MembershipService();
  const customerService = new CustomerService();
  const transactionsService = new TransactionsService(
    productsService,
    usersService,
    customerService,
    membershipService
  );

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
      plugin: rbacPlugin,
      options: {
        validPermissions: [
          "CREATE_PRODUCT",
          "READ_PRODUCT",
          "UPDATE_PRODUCT",
          "DELETE_PRODUCT",
          "CREATE_CATEGORY",
          "READ_CATEGORY",
          "UPDATE_CATEGORY",
          "DELETE_CATEGORY",
          "CREATE_USER",
          "READ_USER",
          "UPDATE_USER",
          "DELETE_USER",
          "CREATE_ROLE",
          "READ_ROLE",
          "UPDATE_ROLE",
          "DELETE_ROLE",
          "CREATE_SUPPLIER",
          "READ_SUPPLIER",
          "UPDATE_SUPPLIER",
          "DELETE_SUPPLIER",
          "CREATE_TRANSACTION",
          "READ_TRANSACTION",
          "CREATE_PURCHASE",
          "READ_PURCHASE",
          "CREATE_DISCOUNT",
          "READ_DISCOUNT",
          "UPDATE_DISCOUNT",
          "DELETE_DISCOUNT",
          "CREATE_CUSTOMER",
          "READ_CUSTOMER",
          "UPDATE_CUSTOMER",
          "DELETE_CUSTOMER",
          "CREATE_MEMBER",
          "READ_MEMBER",
          "UPDATE_MEMBER",
          "DELETE_MEMBER",
          "GET_REPORT",
        ],
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
    {
      plugin: roles,
      options: {
        service: rolesService,
        validator: RolesValidator,
      },
    },
    {
      plugin: discount,
      options: {
        service: discountService,
        validator: DiscountValidator,
      },
    },
    {
      plugin: membership,
      options: {
        service: membershipService,
        validator: MembershipValidator,
      },
    },
    {
      plugin: customers,
      options: {
        service: customerService,
        validator: CustomersValidator,
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

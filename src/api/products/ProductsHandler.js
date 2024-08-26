const autoBind = require("auto-bind");
const sortingProduct = require("../../utils/sortingProduct");

class ProductsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getProductsHandler(request, h) {
    this._validator.validateSortQuery(request.query);
    const { orderBy, sortBy, filter, name, page, limit } = request.query;

    const products = await this._service.getProducts({
      orderBy,
      sortBy,
      filter,
      name,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return h
      .response({
        status: "success",
        data: {
          products,
        },
      })
      .code(200);
  }

  async getProductByIDHandler(request, h) {
    this._validator.validateProductsParams(request.params);
    const { id } = request.params;

    const product = await this._service.getProductByID(id);

    return h
      .response({
        status: "success",
        data: {
          product,
        },
      })
      .code(200);
  }

  async postProductHandler(request, h) {
    this._validator.validateProductsPayload(request.payload);
    const { product_name, price, category_id, amount } = request.payload;

    const newProduct = await this._service.addProduct({
      product_name,
      price,
      category_id,
      amount,
    });

    return h
      .response({
        status: "success",
        message: "Product berhasil ditambahkan",
        data: {
          newProduct,
        },
      })
      .code(201);
  }

  async putProductByIDHandler(request, h) {
    this._validator.validateProductsParams(request.params);
    this._validator.validateProductsPayload(request.payload);
    const { id } = request.params;
    const { product_name, price, category_id, amount } = request.payload;

    const editedProduct = await this._service.editProduct({
      id,
      product_name,
      price,
      category_id,
      amount,
    });

    return h
      .response({
        status: "success",
        message: "Product berhasil diubah",
        data: {
          editedProduct,
        },
      })
      .code(200);
  }

  async deleteProductByIDHandler(request, h) {
    this._validator.validateProductsParams(request.params);

    const { id } = request.params;

    const deletedProduct = await this._service.deleteProduct(id);

    return h
      .response({
        status: "success",
        message: "Product berhasil dihapus",
        data: {
          deletedProduct,
        },
      })
      .code(200);
  }

  async editStockHandler(request, h) {
    this._validator.validateProductsParams(request.params);
    this._validator.validateEditStock(request.payload);

    const { id } = request.params;
    const { amount } = request.payload;

    const newAmount = await this._service.editStock({ id, amount });
    return h
      .response({
        status: "success",
        message: "Stock berhasil diubah",
        data: {
          newAmount,
        },
      })
      .code(200);
  }

  async editPriceHandler(request, h) {
    this._validator.validateProductsParams(request.params);
    this._validator.validateEditPrice(request.payload);

    const { id } = request.params;
    const { price } = request.payload;

    const newPrice = await this._service.editPrice({ id, price });

    return h
      .response({
        status: "success",
        message: "Harga berhasil diubah",
        data: {
          newPrice,
        },
      })
      .code(200);
  }
}

module.exports = ProductsHandler;

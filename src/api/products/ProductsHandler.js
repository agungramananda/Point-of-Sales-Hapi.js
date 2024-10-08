const autoBind = require("auto-bind");

class ProductsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getProductsHandler(request, h) {
    this._validator.validateSortQuery(request.query);
    const { orderBy, sortBy, category, name, page, limit } = request.query;

    const products = await this._service.getProducts({
      orderBy,
      sortBy,
      category,
      name,
      page,
      limit,
    });

    return h
      .response({
        status: "success",
        data: products.data,
        page_info: products.page_info,
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
    this._validator.validateAddProduct(request.payload);
    const { product_name, price, category_id, safety_stock, maximum_stock } =
      request.payload;

    const newProduct = await this._service.addProduct({
      product_name,
      category_id,
      price,
      safety_stock,
      maximum_stock,
    });

    return h
      .response({
        status: "success",
        message: "Product successfully added",
      })
      .code(201);
  }

  async putProductByIDHandler(request, h) {
    this._validator.validateProductsParams(request.params);
    this._validator.validateUpdateProduct(request.payload);
    const { id } = request.params;
    const { product_name, category_id } = request.payload;

    await this._service.editProduct({
      id,
      product_name,
      category_id,
    });

    return h
      .response({
        status: "success",
        message: "Product successfully updated",
      })
      .code(200);
  }

  async deleteProductByIDHandler(request, h) {
    this._validator.validateProductsParams(request.params);

    const { id } = request.params;

    await this._service.deleteProduct(id);

    return h
      .response({
        status: "success",
        message: "Product successfully deleted",
      })
      .code(200);
  }
}

module.exports = ProductsHandler;

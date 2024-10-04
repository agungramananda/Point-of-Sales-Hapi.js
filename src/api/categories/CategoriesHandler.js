const autoBind = require("auto-bind");
class CategoriesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postCategoryHandler(request, h) {
    this._validator.validateCategoryPayload(request.payload);

    const { category } = request.payload;

    await this._service.addCategory(category);

    return h
      .response({
        status: "success",
        message: "Category successfully added",
      })
      .code(201);
  }

  async getCategoriesHandler(request, h) {
    const { category, limit, page } = request.query;
    this._validator.validateCategoryQuery({
      category,
      limit,
      page,
    });
    const categories = await this._service.getCategories({
      category,
      limit,
      page,
    });

    return h
      .response({
        status: "success",
        data: categories.data,
        page_info: categories.page_info,
      })
      .code(200);
  }

  async putCategoryByIdHandler(request, h) {
    this._validator.validateCategoryPayload(request.payload);
    this._validator.validateCategoryParam(request.params);

    const { id } = request.params;
    const { category } = request.payload;

    await this._service.editCategory(id, category);

    return h
      .response({
        status: "success",
        message: "Category successfully edited",
      })
      .code(200);
  }

  async deleteCategoryByIdHandler(request, h) {
    this._validator.validateCategoryParam(request.params);

    const { id } = request.params;

    await this._service.deleteCategory(id);

    return h
      .response({
        status: "success",
        message: "Category successfully deleted",
      })
      .code(200);
  }
}

module.exports = CategoriesHandler;

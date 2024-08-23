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

    const newCategory = await this._service.addCategory(category);

    return h
      .response({
        status: "success",
        message: "Kategori berhasil ditambahkan",
        data: {
          newCategory,
        },
      })
      .code(201);
  }

  async getCategoriesHandler(_, h) {
    const categories = await this._service.getCategories();

    return h
      .response({
        status: "success",
        categories,
      })
      .code(200);
  }

  async putCategoryByIdHandler(request, h) {
    this._validator.validateCategoryPayload(request.payload);
    this._validator.validateCategoryParam(request.params);

    const { id } = request.params;
    const { category } = request.payload;

    const editedCategory = await this._service.editCategory(id, category);

    return h
      .response({
        status: "success",
        message: "Kategori berhasil diubah",
        data: {
          editedCategory,
        },
      })
      .code(200);
  }

  async deleteCategoryByIdHandler(request, h) {
    this._validator.validateCategoryParam(request.params);

    const { id } = request.params;

    const deletedCategory = await this._service.deleteCategory(id);

    return h
      .response({
        status: "success",
        message: "Kategori berhasil dihapus",
        deletedCategory,
      })
      .code(200);
  }
}

module.exports = CategoriesHandler;

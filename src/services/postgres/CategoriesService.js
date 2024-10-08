const { Pool } = require("pg");

const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { searchName } = require("../../utils/searchName");

class CategoriesService {
  constructor() {
    this._pool = new Pool();
  }

  async addCategory(category) {
    const checkQuery = {
      text: "SELECT id FROM categories WHERE category = $1 AND deleted_at IS NULL",
      values: [category],
    };

    const query = {
      text: "INSERT INTO categories (category) VALUES($1) RETURNING category",
      values: [category],
    };

    try {
      const isDuplicate = await this._pool.query(checkQuery);

      if (isDuplicate.rows[0]) {
        throw new InvariantError("Category already exists");
      }

      const result = await this._pool.query(query);

      if (!result.rows[0]) {
        throw new InvariantError(
          "Failed to add category, category must be a string"
        );
      }

      return;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getCategories({ category, limit, page }) {
    let query = "SELECT id,category FROM categories WHERE deleted_at IS NULL";
    query = searchName(
      { keyword: category },
      "categories c",
      "c.category",
      query
    );
    const p = pagination({ limit, page });
    const page_info = await getMaxPage(p, query);
    query += ` LIMIT ${p.limit} OFFSET ${p.offset}`;

    try {
      const result = await this._pool.query(query);
      return { data: result.rows, page_info };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async editCategory(id, category) {
    const updatedAt = new Date();

    const checkQuery = {
      text: "SELECT id FROM categories WHERE category = $1 AND deleted_at IS NULL AND id != $2",
      values: [category, id],
    };

    const query = {
      text: "UPDATE categories SET category = $1,updated_at = $2 WHERE id = $3 AND deleted_at IS NULL RETURNING category",
      values: [category, updatedAt, id],
    };

    try {
      const isDuplicate = await this._pool.query(checkQuery);

      if (isDuplicate.rows[0]) {
        throw new InvariantError(
          `Category already exists, category must be unique`
        );
      }

      const result = await this._pool.query(query);

      if (result.rows.length === 0) {
        throw new NotFoundError("Category not found");
      }

      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async deleteCategory(id) {
    const deletedAt = new Date();

    const query = {
      text: "UPDATE categories SET deleted_at = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING category",
      values: [deletedAt, id],
    };

    try {
      const result = await this._pool.query(query);

      if (result.rows.length === 0) {
        throw new NotFoundError("Category not found");
      }

      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = CategoriesService;

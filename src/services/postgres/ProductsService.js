const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { sortingProduct } = require("../../utils/sortingProduct");
const { filterQuery } = require("../../utils/filterQuery");
const { pagination, getMaxPage } = require("../../utils/pagination");
const { searchName } = require("../../utils/searchName");

class ProductsService {
  constructor() {
    this._pool = new Pool();
  }

  async getProducts({ orderBy, sortBy, category, name, page, limit }) {
    let query = `
      SELECT 
        p.id, p.product_name, p.category_id, c.category, p.price, s.amount, s.safety_stock, s.maximum_stock
      FROM
        products p
      LEFT JOIN
        categories c ON p.category_id = c.id
      LEFT JOIN
        stock s ON p.id = s.product_id
      WHERE
        p.deleted_at IS NULL
    `;
    query = searchName(
      { keyword: name },
      "products p",
      "p.product_name",
      query
    );
    query = await filterQuery(
      { keyword: category },
      "categories c",
      "c.category",
      query
    );
    query = sortingProduct({ orderBy, sortBy }, query);
    const p = pagination({ limit, page });

    const sql = {
      text: `${query} LIMIT $1 OFFSET $2`,
      values: [p.limit, p.offset],
    };
    const page_info = await getMaxPage(p, query);
    try {
      const result = await this._pool.query(sql);
      return { data: result.rows, page_info };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getProductByID(id) {
    const query = {
      text: `
        SELECT 
          p.id, p.product_name, p.category_id, p.price, c.category, s.amount, s.safety_stock, s.maximum_stock
        FROM
          products p
        LEFT JOIN
          categories c ON p.category_id = c.id
        LEFT JOIN
          stock s ON p.id = s.product_id
        WHERE
          p.deleted_at IS NULL AND p.id = $1
      `,
      values: [id],
    };
    try {
      const result = await this._pool.query(query);

      if (!result.rows[0]) {
        throw new NotFoundError(`Product with id ${id} not found`);
      }

      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addProduct({
    product_name,
    category_id,
    price,
    safety_stock,
    maximum_stock,
  }) {
    await this._validateProduct(product_name, category_id);

    const productQuery = {
      text: `
        INSERT INTO products (product_name, category_id, price)
        VALUES ($1, $2, $3)
        RETURNING id, product_name, price, category_id
      `,
      values: [product_name, category_id, price],
    };

    try {
      await this._pool.query("BEGIN");

      const insertProduct = await this._pool.query(productQuery);
      if (!insertProduct.rows[0]) {
        throw new InvariantError("Failed to add product");
      }

      const stockQuery = {
        text: `
          INSERT INTO stock (product_id, amount, safety_stock, maximum_stock)
          VALUES ($1, $2, $3, $4)
          RETURNING amount
        `,
        values: [insertProduct.rows[0].id, 0, safety_stock, maximum_stock],
      };

      await this._pool.query(stockQuery);
      await this._pool.query("COMMIT");

      return [{ ...insertProduct.rows[0] }];
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async editProduct({ id, product_name, category_id }) {
    await this._validateProduct(product_name, category_id, id);

    const updated_at = new Date();
    const productQuery = {
      text: `
        UPDATE products 
        SET product_name = $1, category_id = $2, updated_at = $3
        WHERE id = $4 AND deleted_at IS NULL
        RETURNING id, product_name, price, category_id
      `,
      values: [product_name, category_id, updated_at, id],
    };

    try {
      const updateProduct = await this._pool.query(productQuery);

      if (!updateProduct.rows[0]) {
        throw new NotFoundError("Product not found");
      }

      return [{ ...updateProduct.rows[0] }];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async deleteProduct(id) {
    const deletedAt = new Date();

    const query = {
      text: "UPDATE products SET deleted_at = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING product_name",
      values: [deletedAt, id],
    };

    try {
      const result = await this._pool.query(query);

      if (result.rows.length === 0) {
        throw new NotFoundError("Product not found");
      }

      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async _validateProduct(product_name, category_id, id = null) {
    const checkQuery = {
      text: `SELECT id FROM products WHERE product_name = $1 AND deleted_at IS NULL ${
        id ? "AND id != $2" : ""
      }`,
      values: id ? [product_name, id] : [product_name],
    };

    const checkCategory = {
      text: "SELECT id FROM categories WHERE id = $1",
      values: [category_id],
    };

    try {
      const isDuplicate = await this._pool.query(checkQuery);
      if (isDuplicate.rows[0]) {
        throw new InvariantError(
          `Product with name ${product_name} already exists`
        );
      }

      const isCategory = await this._pool.query(checkCategory);
      if (isCategory.rows.length === 0) {
        throw new NotFoundError("Category not found");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = ProductsService;

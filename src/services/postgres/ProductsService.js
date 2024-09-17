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
        p.id, p.product_name, p.price, p.category_id, c.category, s.amount
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
    const infoPage = await getMaxPage(p, query);
    try {
      const result = await this._pool.query(sql);

      return { data: result.rows, infoPage };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getProductByID(id) {
    const query = {
      text: `
        SELECT 
        p.id, p.product_name, p.price, p.category_id, c.category, s.amount
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
        throw new NotFoundError("Product tidak ada");
      }

      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addProduct({ product_name, price, category_id }) {
    const checkQuery = {
      text: "SELECT id FROM products WHERE product_name = $1 AND deleted_at IS NULL",
      values: [product_name],
    };

    const checkCategory = {
      text: "SELECT id FROM categories WHERE id = $1",
      values: [category_id],
    };

    try {
      const isDuplicate = await this._pool.query(checkQuery);
      if (isDuplicate.rows[0]) {
        throw new InvariantError(
          `Product dengan nama ${product_name} sudah ada`
        );
      }
      const isCategory = await this._pool.query(checkCategory);
      if (isCategory.rows.length === 0) {
        throw new NotFoundError("Category tidak ada");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }

    try {
      const productQuery = {
        text: `
          INSERT INTO products (product_name,price,category_id)
          VALUES ($1, $2, $3)
          RETURNING id, product_name,price,category_id
        `,
        values: [product_name, price, category_id],
      };

      const insertProduct = await this._pool.query(productQuery);

      if (!insertProduct.rows[0]) {
        throw new InvariantError("Product gagal ditambahkan");
      }

      const stockQuery = {
        text: `
          INSERT INTO stock (product_id, amount)
          VALUES ($1, $2)
          RETURNING amount
        `,
        values: [insertProduct.rows[0].id, 0],
      };

      await this._pool.query(stockQuery);

      const result = [{ ...insertProduct.rows[0] }];

      return result;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async editProduct({ id, product_name, price, category_id }) {
    const updated_at = new Date();
    const productQuery = {
      text: `
        UPDATE products 
        SET product_name = $1, price = $2, category_id = $3, updated_at = $4
        WHERE id = $5 AND deleted_at IS NULL
        RETURNING id, product_name,price,category_id
      `,
      values: [product_name, price, category_id, updated_at, id],
    };

    const checkQuery = {
      text: "SELECT id FROM products WHERE product_name = $1 AND deleted_at IS NULL AND id != $2",
      values: [product_name, id],
    };

    const checkCategory = {
      text: "SELECT id FROM categories WHERE id = $1",
      values: [category_id],
    };
    try {
      const isDuplicate = await this._pool.query(checkQuery);
      if (isDuplicate.rows[0]) {
        throw new InvariantError(
          `Product dengan nama ${product_name} sudah ada`
        );
      }
      const isCategory = await this._pool.query(checkCategory);
      if (isCategory.rows.length === 0) {
        throw new NotFoundError("Category tidak ada");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }

    try {
      const updateProduct = await this._pool.query(productQuery);

      if (!updateProduct.rows[0]) {
        throw new NotFoundError("Product tidak ada");
      }
      const result = [{ ...updateProduct.rows[0] }];

      return result;
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
        throw new NotFoundError("Product tidak ditemukan");
      }

      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async editStock({ id, amount }) {
    const checkQuery = {
      text: "SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL",
      values: [id],
    };

    try {
      const product = await this._pool.query(checkQuery);
      if (product.rows.length == 0) {
        throw new NotFoundError("Produk tidak ada");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }

    const query = {
      text: "UPDATE stock SET amount = $1 WHERE product_id = $2 RETURNING amount",
      values: [amount, id],
    };
    try {
      const result = await this._pool.query(query);
      return result.rows;
    } catch (error) {
      return new InvariantError(error.message);
    }
  }

  async editPrice({ id, price }) {
    const updated_at = new Date();

    const checkQuery = {
      text: "SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL",
      values: [id],
    };

    try {
      const product = await this._pool.query(checkQuery);
      if (product.rows.length == 0) {
        throw new NotFoundError("Produk tidak ada");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }

    const query = {
      text: "UPDATE products SET price = $1, updated_at = $2 WHERE id = $3 AND deleted_at IS NULL RETURNING product_name, price",
      values: [price, updated_at, id],
    };

    try {
      const result = await this._pool.query(query);

      if (result.rows.length == 0) {
        return new NotFoundError("Product tidak ada");
      }
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = ProductsService;

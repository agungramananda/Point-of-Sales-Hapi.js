const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");

const filterProduct = async ({ category }, sql) => {
  if (!category) {
    return sql;
  }
  const pool = new Pool();
  try {
    const checkQuery = {
      text: `SELECT id FROM categories WHERE category = $1`,
      values: [category],
    };
    const check = await pool.query(checkQuery);
    if (check.rows.length === 0) {
      throw new InvariantError(
        "Gagal mendapatkan produk. Kategori tidak valid"
      );
    }
    sql += ` AND c.category = '${category}'`;
    return sql;
  } catch (error) {
    throw new InvariantError(error.message);
  }
};

module.exports = { filterProduct };

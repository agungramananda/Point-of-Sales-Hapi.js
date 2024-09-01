const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const searchName = ({ keyword }, table, column, sql) => {
  if (!keyword) {
    return sql;
  }
  const pool = new Pool();
  try {
    const checkQuery = {
      text: `SELECT ${
        table[table.length - 1]
      }.id FROM ${table} WHERE ${column} = $1`,
      values: [keyword],
    };
    const check = pool.query(checkQuery);
    if (check.rows.length === 0) {
      throw new InvariantError(
        "Gagal mendapatkan produk. Nama produk tidak valid"
      );
    }
  } catch (error) {}
  sql += ` AND ${column} LIKE '%${keyword}%'`;
  return sql;
};

module.exports = { searchName };

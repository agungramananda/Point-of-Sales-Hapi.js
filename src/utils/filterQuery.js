const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");

const filterQuery = async ({ keyword }, table, column, sql) => {
  if (!keyword) {
    return sql;
  }
  const pool = new Pool();
  const insial = table[table.length - 1];
  try {
    const checkQuery = {
      text: `SELECT ${insial}.id FROM ${table} WHERE ${column} = $1`,
      values: [keyword],
    };
    const check = await pool.query(checkQuery);
    if (check.rows.length === 0) {
      throw new InvariantError(
        `Gagal mengambil data. ${keyword} tidak ada dalam ${table.slice(0, -1)}`
      );
    }
    sql += ` AND ${column} = '${keyword}'`;
    return sql;
  } catch (error) {
    throw new InvariantError(error.message);
  }
};

module.exports = { filterQuery };

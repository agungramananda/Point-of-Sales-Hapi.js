const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");

const pagination = ({ limit, page }) => {
  limit = limit ? +limit : 25;
  page = page ? +page : 1;
  const offset = (page - 1) * limit;

  return { limit, page, offset };
};

const getMaxPage = async ({ limit, page }, table) => {
  const pool = new Pool();
  try {
    const result = await pool.query(`SELECT COUNT(*) AS total FROM ${table}`);
    if (result.rows.length === 0) {
      throw new InvariantError("Data tidak ditemukan");
    }
    const maxPage = Math.ceil(result.rows[0].total / limit);
    if (maxPage >= page) {
      return {
        currentPage: page,
        totalItems: result.rows[0].total,
        totalPages: maxPage,
      };
    } else {
      throw new InvariantError(`Halaman hanya sampai ${maxPage}`);
    }
  } catch (error) {
    throw new InvariantError(error.message);
  }
};

module.exports = { pagination, getMaxPage };

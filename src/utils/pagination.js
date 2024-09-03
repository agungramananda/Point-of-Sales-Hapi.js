const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");

const pagination = ({ limit, page }) => {
  limit = limit ? +limit : 25;
  page = page ? +page : 1;
  const offset = (page - 1) * limit;

  return { limit, page, offset };
};

const getMaxPage = async ({ limit, page }, query) => {
  const pool = new Pool();
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS total FROM (${query}) AS total_query`
    );

    const totalItems = parseInt(result.rows[0].total, 10);
    const maxPage = Math.ceil(totalItems / limit);

    if (totalItems === 0) {
      return {
        currentPage: 1,
        limit: limit,
        totalItems: 0,
        totalPages: 1,
      };
    }

    if (maxPage >= page) {
      return {
        currentPage: page,
        limit: limit,
        totalItems: totalItems,
        totalPages: maxPage,
      };
    } else {
      throw new InvariantError(`Halaman hanya sampai ${maxPage}`);
    }
  } catch (error) {
    throw new Error(error);
  } finally {
    await pool.end();
  }
};

module.exports = { pagination, getMaxPage };

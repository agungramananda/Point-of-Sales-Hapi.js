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
        current_page: 1,
        limit: limit,
        total_items: 0,
        total_pages: 1,
      };
    }

    if (maxPage >= page) {
      return {
        current_page: page,
        limit: limit,
        total_items: totalItems,
        total_pages: maxPage,
      };
    } else {
      throw new InvariantError(`Page only goes up to ${maxPage}`);
    }
  } catch (error) {
    throw new Error(error);
  } finally {
    await pool.end();
  }
};

module.exports = { pagination, getMaxPage };

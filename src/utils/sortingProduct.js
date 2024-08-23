const sortingProduct = ({ orderBy, sortBy }, sql) => {
  let sort = sortBy.toUpperCase();

  if (orderBy == "name") {
    sql += `ORDER BY p.product_name`;
  } else if (orderBy == "category") {
    sql += `ORDER BY c.category`;
  } else if (orderBy == "updated") {
    sql += `ORDER BY p.updated_at`;
  } else {
    sql += `ORDER BY p.id`;
  }

  if (orderBy != null) {
    if (sort == "ASC" || sort == null) {
      sql += " ASC";
    } else if (sort == "DESC") {
      sql += " DESC";
    }
  }

  return sql;
};

module.exports = { sortingProduct };

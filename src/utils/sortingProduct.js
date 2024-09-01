const sortingProduct = ({ orderBy, sortBy }, sql) => {
  if (orderBy == null && sortBy == null) {
    return sql;
  }
  if (!sortBy) {
    sortBy = "ASC";
  }
  let sort = sortBy.toUpperCase();

  if (orderBy == "name") {
    sql += ` ORDER BY p.product_name`;
  } else if (orderBy == "category") {
    sql += ` ORDER BY p.category_id`;
  } else if (orderBy == "updated") {
    sql += ` ORDER BY p.updated_at`;
  } else if (orderBy == "price") {
    sql += ` ORDER BY p.price`;
  } else {
    sql += ` ORDER BY p.id`;
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

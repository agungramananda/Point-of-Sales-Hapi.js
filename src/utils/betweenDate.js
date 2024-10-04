const beetwenDate = (startDate, endDate, column, sql) => {
  if (startDate === undefined || endDate === undefined) {
    return sql;
  }

  if (startDate === "" || endDate === "") {
    return sql;
  } else if (startDate !== "" && endDate !== "") {
    sql += ` AND ${column} BETWEEN '${startDate}' AND '${endDate}'`;
  } else if (startDate !== "" && endDate === "") {
    sql += ` AND ${column} >= '${startDate}'`;
  } else if (startDate === "" && endDate !== "") {
    sql += ` AND ${column} <= '${endDate}'`;
  }
  return sql;
};

module.exports = { beetwenDate };

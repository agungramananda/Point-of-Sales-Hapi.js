const beetwenDate = (startDate, endDate, column, sql) => {
  if (startDate === undefined || endDate === undefined) {
    return sql;
  }

  if (startDate === "") {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
  } else {
    startDate = new Date(startDate);
    startDate.setDate(startDate.getDate() - 1);
  }

  if (endDate === "") {
    endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
  } else {
    endDate = new Date(endDate);
    endDate.setDate(endDate.getDate() + 1);
  }

  sql += ` AND ${column} BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}' `;
  return sql;
};

module.exports = { beetwenDate };

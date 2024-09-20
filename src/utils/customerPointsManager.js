async function addCustomerPoints(pool, customer, total_price) {
  try {
    await pool.query("BEGIN");
    const pointsRulesQuery = {
      text: `SELECT * FROM points_rules`,
    };
    const pointsRules = await pool.query(pointsRulesQuery);
    let points = 0;

    if (total_price < pointsRules.rows[0].min_amount_of_transaction) {
      await pool.query("COMMIT");
      return;
    }

    points = Math.round(
      (total_price * pointsRules.rows[0].points) /
        pointsRules.rows[0].amount_of_spent
    );

    const customerPointsQuery = {
      text: `update customer set points = points + $1 where id = $2 and deleted_at is null returning points`,
      values: [points, customer.id],
    };

    const customerPoints = await pool.query(customerPointsQuery);

    console.log(customerPoints.rows[0].points);

    const checkMembership = {
      text: `
      select m.id
      from membership m 
      where m.min_point < $1 and m.deleted_at is null and m.membership_category != $2
      order by m.min_point desc limit 1`,
      values: [customerPoints.rows[0].points, customer.membership_category],
    };

    const checkMembershipResult = await pool.query(checkMembership);

    console.log(checkMembershipResult.rows);
    if (checkMembershipResult.rows.length === 0) {
      await pool.query("COMMIT");
      return;
    }

    const updateMembership = {
      text: `update customer set membership_id = $1 where id = $2 and deleted_at is null`,
      values: [checkMembershipResult.rows[0].id, customer.id],
    };

    await pool.query(updateMembership);
    await pool.query("COMMIT");
    return;
  } catch (error) {
    await pool.query("ROLLBACK");
    throw new Error(error.message);
  }
}

module.exports = { addCustomerPoints };

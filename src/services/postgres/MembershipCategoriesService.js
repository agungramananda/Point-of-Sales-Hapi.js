const { Pool } = require("pg");

class MembershipCategoriesService {
  constructor() {
    this.pool = new Pool();
  }

  async getMembershipCategories({ membership_type, page, limit }) {
    const query = {
      text: `SELECT * FROM members_category`,
    };

    const result = await this.pool.query(query);
    return result.rows;
  }
}

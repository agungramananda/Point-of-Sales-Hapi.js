const { Pool } = require("pg");
const AuthorizationError = require("../../exceptions/AuthorizationError");

const pool = new Pool();

const verifyPermission = async (userPermission, serverPermission) => {
  const query = {
    text: `select p.permission
    from roles r
    join role_permissions rp on r.id = rp.role_id 
    join permissions p on rp.permission_id = p.id
    where r.role = $1 and r.deleted_at is null`,
    values: [userPermission],
  };

  try {
    const result = await pool.query(query);
    if (result.rows.length === 0) {
      throw new AuthorizationError("Anda tidak memiliki akses");
    }

    const isMatch = result.rows.find(
      (item) => item.permission === serverPermission
    );
    if (!isMatch) {
      throw new AuthorizationError("Anda tidak memiliki akses");
    }

    return true;
  } catch (error) {
    throw new AuthorizationError(error.message);
  }
};

module.exports = { verifyPermission };

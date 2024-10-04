const { Pool } = require("pg");
const { searchName } = require("../../utils/searchName");
const { pagination, getMaxPage } = require("../../utils/pagination");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class RolesService {
  constructor() {
    this._pool = new Pool();
  }

  async getRoles({ name, page, limit }) {
    let query = `SELECT r.id, r.role FROM roles r WHERE r.deleted_at IS NULL`;
    query = await searchName({ keyword: name }, "roles", "r.role", query);
    const p = pagination({ limit, page });
    const page_info = await getMaxPage(p, query);

    try {
      const result = await this._pool.query(
        query + ` LIMIT ${p.limit} OFFSET ${p.offset}`
      );
      return {
        data: result.rows,
        page_info: page_info,
      };
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getRoleById(id) {
    const query = {
      text: `
        SELECT 
          r.role,
          array_agg(p.permission) AS permissions
        FROM 
          roles r
        LEFT JOIN 
          role_permissions rp ON r.id = rp.role_id
        LEFT JOIN 
          permissions p ON rp.permission_id = p.id
        WHERE 
          r.deleted_at IS NULL
          AND r.id = $1
        GROUP BY 
          r.role;
      `,
      values: [id],
    };

    try {
      const result = await this._pool.query(query);
      if (!result.rows[0]) {
        throw new NotFoundError("Role not found");
      }
      return result.rows[0];
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async getPermissions() {
    const query = {
      text: "SELECT id, permission FROM permissions",
    };

    try {
      const result = await this._pool.query(query);
      return result.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async addRole({ role, permissionsList }) {
    await this._validateRole(role);

    await this._pool.query("BEGIN");

    try {
      const newRole = await this._pool.query(
        "INSERT INTO roles (role) VALUES ($1) RETURNING id",
        [role]
      );
      const roleId = newRole.rows[0].id;

      for (const permission of permissionsList) {
        await this._pool.query(
          "INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)",
          [roleId, permission]
        );
      }
      await this._pool.query("COMMIT");
      return newRole.rows;
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async editRole({ id, role, permissionsList }) {
    await this._validateRole(role, id);

    await this._pool.query("BEGIN");

    try {
      const editedRole = await this._pool.query(
        "UPDATE roles SET role = $1 WHERE id = $2 RETURNING id",
        [role, id]
      );
      if (!editedRole.rows[0]) {
        throw new NotFoundError("Failed to update role");
      }

      const currentPermissions = await this._pool.query(
        "SELECT permission_id FROM role_permissions WHERE role_id = $1",
        [id]
      );
      const currentPermissionsList = currentPermissions.rows.map(
        (permission) => permission.permission_id
      );
      const newPermissionsList = new Set(permissionsList);

      for (const permission of currentPermissionsList) {
        if (!newPermissionsList.has(permission)) {
          await this._pool.query(
            "DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2",
            [id, permission]
          );
        }
      }

      for (const permission of permissionsList) {
        if (!currentPermissionsList.includes(permission)) {
          await this._pool.query(
            "INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)",
            [id, permission]
          );
        }
      }
      await this._pool.query("COMMIT");
    } catch (error) {
      await this._pool.query("ROLLBACK");
      throw new InvariantError(error.message);
    }
  }

  async deleteRole(id) {
    try {
      const check = await this._pool.query(
        "SELECT id FROM roles WHERE id = $1 AND deleted_at IS NOT NULL",
        [id]
      );
      if (check.rows.length !== 0) {
        throw new NotFoundError("Role not found");
      }
      const deletedRole = await this._pool.query(
        "UPDATE roles SET deleted_at = current_timestamp WHERE id = $1 AND deleted_at IS NULL RETURNING id",
        [id]
      );
      return deletedRole.rows;
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }

  async _validateRole(role, id = null) {
    const checkQuery = {
      text: `SELECT id FROM roles WHERE role = $1 AND deleted_at IS NULL ${
        id ? "AND id != $2" : ""
      }`,
      values: id ? [role, id] : [role],
    };

    try {
      const check = await this._pool.query(checkQuery);
      if (check.rows.length > 0) {
        throw new InvariantError("Role already registered");
      }
    } catch (error) {
      throw new InvariantError(error.message);
    }
  }
}

module.exports = RolesService;

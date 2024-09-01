const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "kasir",
  password: "123",
  port: 5432, // default PostgreSQL port
});

async function main() {
  const query = {
    text: `SELECT 
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
    AND r.id = 1
GROUP BY 
    r.role;`,
  };
  const result = await pool.query(query);
  console.log(result.rows);
}

main()
  .catch(console.error)
  .finally(() => pool.end());

const a = {
  "select * from permissions p ": [
    {
      permission: "CREATE_PRODUCT",
    },
    {
      permission: "READ_PRODUCT",
    },
    {
      permission: "UPDATE_PRODUCT",
    },
    {
      permission: "DELETE_PRODUCT",
    },
    {
      permission: "CREATE_CATEGORY",
    },
    {
      permission: "READ_CATEGORY",
    },
    {
      permission: "UPDATE_CATEGORY",
    },
    {
      permission: "DELETE_CATEGORY",
    },
    {
      permission: "CREATE_USER",
    },
    {
      permission: "READ_USER",
    },
    {
      permission: "UPDATE_USER",
    },
    {
      permission: "DELETE_USER",
    },
    {
      permission: "CREATE_ROLE",
    },
    {
      permission: "READ_ROLE",
    },
    {
      permission: "UPDATE_ROLE",
    },
    {
      permission: "DELETE_ROLE",
    },
    {
      permission: "CREATE_SUPPLIER",
    },
    {
      permission: "READ_SUPPLIER",
    },
    {
      permission: "UPDATE_SUPPLIER",
    },
    {
      permission: "DELETE_SUPPLIER",
    },
    {
      permission: "CREATE_TRANSACTION",
    },
    {
      permission: "READ_TRANSACTION",
    },
    {
      permission: "CREATE_PURCHASE",
    },
    {
      permission: "READ_PURCHASE",
    },
    {
      permission: "GET_REPORT",
    },
  ],
};
const json = {
  "select * from permissions p ": [
    {
      permission: "CREATE_PRODUCT",
    },
    {
      permission: "READ_PRODUCT",
    },
    {
      permission: "UPDATE_PRODUCT",
    },
    {
      permission: "DELETE_PRODUCT",
    },
    {
      permission: "CREATE_CATEGORY",
    },
    {
      permission: "READ_CATEGORY",
    },
    {
      permission: "UPDATE_CATEGORY",
    },
    {
      permission: "DELETE_CATEGORY",
    },
    {
      permission: "CREATE_USER",
    },
    {
      permission: "READ_USER",
    },
    {
      permission: "UPDATE_USER",
    },
    {
      permission: "DELETE_USER",
    },
    {
      permission: "CREATE_ROLE",
    },
    {
      permission: "READ_ROLE",
    },
    {
      permission: "UPDATE_ROLE",
    },
    {
      permission: "DELETE_ROLE",
    },
    {
      permission: "CREATE_SUPPLIER",
    },
    {
      permission: "READ_SUPPLIER",
    },
    {
      permission: "UPDATE_SUPPLIER",
    },
    {
      permission: "DELETE_SUPPLIER",
    },
    {
      permission: "CREATE_TRANSACTION",
    },
    {
      permission: "READ_TRANSACTION",
    },
    {
      permission: "CREATE_PURCHASE",
    },
    {
      permission: "READ_PURCHASE",
    },
    {
      permission: "GET_REPORT",
    },
  ],
};

const permissions = Object.values(json)[0].map((obj) => obj.permission);
console.log(permissions);

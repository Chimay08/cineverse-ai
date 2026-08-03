const { Pool } = require("pg");

const dbConfig = {
  host: process.env.PGHOST || process.env.DB_HOST,
  port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
  user: process.env.PGUSER || process.env.DB_USER,
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
  database: process.env.PGDATABASE || process.env.DB_NAME
};

const hasDatabaseConfig =
  Boolean(process.env.DATABASE_URL) ||
  Boolean(dbConfig.host && dbConfig.user && dbConfig.database);

const pool = hasDatabaseConfig
  ? new Pool(
      process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL
          }
        : dbConfig
    )
  : null;

module.exports = pool;

require("dotenv").config();
const { Pool, types } = require("pg");

// PostgreSQL audit timestamps are stored as UTC wall-clock values. Parse them
// identically in local development and deployment, regardless of Node's TZ.
types.setTypeParser(1114, (value) => new Date(`${value}Z`));
// Event dates are calendar values, not instants. Never let Node shift their day.
types.setTypeParser(1082, (value) => value);

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Falling back to local DB env vars.");
}

const isRender = process.env.DATABASE_URL?.includes("render.com");

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      options: "-c timezone=UTC",
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE || process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT) || 5432,
      options: "-c timezone=UTC",
    });

module.exports = pool;

require("dotenv").config(); 

console.log("DATABASE_URL set?", Boolean(process.env.DATABASE_URL));
console.log("DB_HOST is", process.env.DB_HOST);

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,   
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});

module.exports = pool;
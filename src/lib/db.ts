import "server-only";

import mysql from "mysql2/promise";

// mysql2 silently falls back to localhost:3306 when these are unset, which
// surfaces later as a vague ECONNREFUSED. Log only the missing names, never values.
const missingDbEnv = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"].filter(
  (name) => !process.env[name],
);
if (missingDbEnv.length > 0) {
  console.error("Database config missing env vars:", missingDbEnv.join(", "));
}

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
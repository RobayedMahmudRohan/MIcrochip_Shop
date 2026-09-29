import { existsSync } from "node:fs";
import mysql from "mysql2/promise";

// E2E tests only ever create users with this address pattern, on the local
// development database configured in .env.local — never production.
export const E2E_EMAIL_DOMAIN = "e2e.microchip.test";

export function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@${E2E_EMAIL_DOMAIN}`;
}

// Removes every user created by E2E runs (their sessions cascade).
export async function deleteE2EUsers() {
  if (!process.env.DB_HOST && existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await connection.query("DELETE FROM users WHERE email LIKE ?", [
      `e2e-%@${E2E_EMAIL_DOMAIN}`,
    ]);
  } finally {
    await connection.end();
  }
}

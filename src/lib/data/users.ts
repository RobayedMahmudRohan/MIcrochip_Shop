import "server-only";

import { db } from "@/lib/db";

// Database access for the `users` table. No auth rules live here: callers
// (the auth Server Actions) decide what to do with the results.

export type UserCredentials = {
  id: number;
  password_hash: string;
};

export class DuplicateEmailError extends Error {
  constructor() {
    super("A user with this email already exists.");
    this.name = "DuplicateEmailError";
  }
}

export async function emailExists(email: string): Promise<boolean> {
  const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
  return (rows as unknown[]).length > 0;
}

// Only for verifying a login; the hash must never leave the server.
export async function findUserCredentialsByEmail(
  email: string,
): Promise<UserCredentials | null> {
  const [rows] = await db.query(
    "SELECT id, password_hash FROM users WHERE email = ?",
    [email],
  );
  return (rows as UserCredentials[])[0] ?? null;
}

// Returns the new user's id. Throws DuplicateEmailError if the UNIQUE email
// key rejects the insert (e.g. two simultaneous sign-ups).
export async function createUser(user: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<number> {
  try {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [user.name, user.email, user.passwordHash],
    );
    return (result as { insertId: number }).insertId;
  } catch (error) {
    if ((error as { code?: string } | null)?.code === "ER_DUP_ENTRY") {
      throw new DuplicateEmailError();
    }
    throw error;
  }
}

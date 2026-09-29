import "server-only";

import { db } from "@/lib/db";

// Database access for the `sessions` table. Session ids here are already
// hashed tokens; hashing and cookies are handled by src/lib/auth/session.ts.

export type SessionUserRow = {
  id: number;
  name: string;
  role: "customer" | "admin";
};

export async function insertSession(sessionId: string, userId: number, days: number) {
  await db.query(
    `
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (?, ?, NOW() + INTERVAL ? DAY)
    `,
    [sessionId, userId, days],
  );
}

export async function deleteExpiredSessionsForUser(userId: number) {
  await db.query("DELETE FROM sessions WHERE user_id = ? AND expires_at <= NOW()", [
    userId,
  ]);
}

export async function deleteSessionById(sessionId: string) {
  await db.query("DELETE FROM sessions WHERE id = ?", [sessionId]);
}

// The user owning an unexpired session. Selects only non-sensitive columns.
export async function findUserBySessionId(
  sessionId: string,
): Promise<SessionUserRow | null> {
  const [rows] = await db.query(
    `
      SELECT u.id, u.name, u.role
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > NOW()
    `,
    [sessionId],
  );
  return (rows as SessionUserRow[])[0] ?? null;
}

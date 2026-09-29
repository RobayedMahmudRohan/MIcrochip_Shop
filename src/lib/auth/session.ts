import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import {
  deleteExpiredSessionsForUser,
  deleteSessionById,
  findUserBySessionId,
  insertSession,
  type SessionUserRow,
} from "@/lib/data/sessions";

// Session management: token generation, hashing and the session cookie.
// Storage is delegated to src/lib/data/sessions.ts.

const SESSION_DAYS = 30;
const isProduction = process.env.NODE_ENV === "production";

// The `__Host-` prefix makes browsers reject the cookie unless it's Secure,
// has Path=/ and no Domain, so it can't be set or overridden by a subdomain.
// It requires HTTPS, so plain `session` is used in local development.
export const SESSION_COOKIE = isProduction ? "__Host-session" : "session";

export type SessionUser = SessionUserRow;

// Only the SHA-256 of the token is stored, so a leaked sessions table can't be
// used to hijack sessions.
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");

  // Housekeeping: drop this user's expired sessions.
  await deleteExpiredSessionsForUser(userId);
  await insertSession(hashToken(token), userId, SESSION_DAYS);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

// Deletes the session server-side (so a copied cookie stops working) and
// clears the cookie.
export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await deleteSessionById(hashToken(token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

// The signed-in user for this request, or null. Memoized per render pass.
// Returns only non-sensitive fields; never the email or password hash.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  return findUserBySessionId(hashToken(token));
});

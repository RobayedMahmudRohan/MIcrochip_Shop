// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FakeCookieStore, FakeDb } from "@/test/auth-fakes";

const state = vi.hoisted(() => ({
  db: undefined as unknown as FakeDb,
  cookies: undefined as unknown as FakeCookieStore,
}));

vi.mock("@/lib/db", () => ({
  db: { query: (sql: string, params?: unknown[]) => state.db.query(sql, params) },
}));
vi.mock("next/headers", () => ({ cookies: async () => state.cookies }));
vi.mock("next/navigation", async () => {
  const { RedirectSignal, NotFoundSignal } = await import("@/test/auth-fakes");
  return {
    redirect: (url: string) => {
      throw new RedirectSignal(url);
    },
    notFound: () => {
      throw new NotFoundSignal();
    },
  };
});

const { FakeCookieStore: CookieStore, FakeDb: Db, RedirectSignal } = await import(
  "@/test/auth-fakes"
);
const { login, logout, register } = await import("@/lib/auth/actions");
const { getCurrentUser, SESSION_COOKIE } = await import("@/lib/auth/session");
const { hashPassword } = await import("@/lib/auth/password");

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const registration = {
  name: "Ada Lovelace",
  email: "Ada@Example.com",
  password: "engine1843",
  confirmPassword: "engine1843",
};

// Runs an action and returns where it redirected, or its returned state.
async function run<T>(promise: Promise<T>) {
  try {
    return { state: await promise, redirectedTo: undefined };
  } catch (error) {
    if (error instanceof RedirectSignal) return { state: undefined, redirectedTo: error.url };
    throw error;
  }
}

beforeEach(() => {
  state.db = new Db();
  state.cookies = new CookieStore();
});

describe("register", () => {
  it("creates the user with a hashed password, starts a session and redirects", async () => {
    const { redirectedTo } = await run(register({}, form(registration)));

    expect(redirectedTo).toBe("/");

    const [user] = state.db.users;
    expect(user).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com" });
    expect(user.password_hash).not.toContain("engine1843");
    expect(user.password_hash).toMatch(/^scrypt\$/);

    const cookie = state.cookies.jar.get(SESSION_COOKIE);
    expect(cookie?.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    // The DB stores a hash of the token, never the token itself.
    expect(state.db.sessions.size).toBe(1);
    expect(state.db.sessions.has(cookie!.value)).toBe(false);

    expect(await getCurrentUser()).toEqual({ id: user.id, name: "Ada Lovelace", role: "customer" });
  });

  it("redirects to a safe `next` path and ignores external ones", async () => {
    expect((await run(register({}, form({ ...registration, next: "/wishlist" })))).redirectedTo)
      .toBe("/wishlist");

    state.db = new Db();
    expect(
      (await run(register({}, form({ ...registration, next: "https://evil.example" }))))
        .redirectedTo,
    ).toBe("/");
  });

  it("rejects a duplicate email (case-insensitively) without creating a session", async () => {
    state.db.addUser({ name: "Existing", email: "ada@example.com", password_hash: "x" });

    const { state: result } = await run(register({}, form(registration)));

    expect(result?.errors?.email).toBe("An account with this email already exists.");
    expect(state.db.users).toHaveLength(1);
    expect(state.cookies.jar.size).toBe(0);
  });

  it("validates on the server and never echoes passwords back", async () => {
    const { state: result } = await run(
      register({}, form({ ...registration, confirmPassword: "different1" })),
    );

    expect(result?.errors).toEqual({ confirmPassword: "Passwords do not match." });
    expect(result?.fields).toEqual({ name: "Ada Lovelace", email: "Ada@Example.com" });
    expect(JSON.stringify(result)).not.toContain("engine1843");
    expect(state.db.users).toHaveLength(0);
  });
});

describe("login", () => {
  beforeEach(async () => {
    state.db.addUser({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password_hash: await hashPassword("engine1843"),
    });
  });

  it("logs in with correct credentials and redirects to `next`", async () => {
    const { redirectedTo } = await run(
      login({}, form({ email: " ADA@example.com ", password: "engine1843", next: "/profile" })),
    );

    expect(redirectedTo).toBe("/profile");
    expect(state.cookies.jar.get(SESSION_COOKIE)?.options).toMatchObject({ httpOnly: true });
    expect((await getCurrentUser())?.name).toBe("Ada Lovelace");
  });

  it("returns the same generic error for a wrong password and an unknown email", async () => {
    const wrongPassword = await run(
      login({}, form({ email: "ada@example.com", password: "wrong-pass1" })),
    );
    const unknownEmail = await run(
      login({}, form({ email: "nobody@example.com", password: "engine1843" })),
    );

    expect(wrongPassword.state?.message).toBe("Invalid email or password.");
    expect(unknownEmail.state?.message).toBe("Invalid email or password.");
    expect(JSON.stringify(wrongPassword.state)).not.toContain("wrong-pass1");
    expect(state.cookies.jar.size).toBe(0);
  });

  it("validates input before touching the database", async () => {
    const querySpy = vi.spyOn(state.db, "query");
    const { state: result } = await run(login({}, form({ email: "bad", password: "" })));

    expect(result?.errors).toEqual({
      email: "Enter a valid email address.",
      password: "Password is required.",
    });
    expect(querySpy).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  it("invalidates the session server-side and clears the cookie", async () => {
    await run(register({}, form(registration)));
    const token = state.cookies.jar.get(SESSION_COOKIE)!.value;

    const { redirectedTo } = await run(logout());

    expect(redirectedTo).toBe("/");
    expect(state.cookies.jar.has(SESSION_COOKIE)).toBe(false);
    expect(state.db.sessions.size).toBe(0);

    // Replaying the old cookie no longer authenticates.
    state.cookies.set(SESSION_COOKIE, token);
    expect(await getCurrentUser()).toBeNull();
  });
});

describe("getCurrentUser", () => {
  it("returns null without a cookie, with an unknown token, or after expiry", async () => {
    expect(await getCurrentUser()).toBeNull();

    state.cookies.set(SESSION_COOKIE, "forged-token");
    expect(await getCurrentUser()).toBeNull();

    await run(register({}, form(registration)));
    for (const session of state.db.sessions.values()) session.expiresAt = Date.now() - 1;
    expect(await getCurrentUser()).toBeNull();
  });
});

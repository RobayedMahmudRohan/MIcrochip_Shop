// @vitest-environment node
import { describe, expect, it } from "vitest";
import { hashPassword, verifyAgainstDummyHash, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("never stores the plain-text password", async () => {
    const hash = await hashPassword("engine1843");

    expect(hash).not.toContain("engine1843");
    expect(hash).toMatch(/^scrypt\$32768\$8\$3\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
  });

  it("uses a unique salt per hash", async () => {
    const [a, b] = await Promise.all([hashPassword("same-pass1"), hashPassword("same-pass1")]);
    expect(a).not.toBe(b);
  });

  it("verifies the correct password and rejects others", async () => {
    const hash = await hashPassword("engine1843");

    expect(await verifyPassword("engine1843", hash)).toBe(true);
    expect(await verifyPassword("engine1844", hash)).toBe(false);
    expect(await verifyPassword("", hash)).toBe(false);
  });

  it("rejects malformed stored hashes instead of throwing", async () => {
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
    expect(await verifyPassword("x", "scrypt$a$b$c$d$e")).toBe(false);
  });

  it("dummy verification always fails", async () => {
    expect(await verifyAgainstDummyHash("anything")).toBe(false);
  });
});

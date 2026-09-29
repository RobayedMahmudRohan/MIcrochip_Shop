import { describe, expect, it } from "vitest";
import {
  normalizeEmail,
  safeRedirectPath,
  validateLogin,
  validateRegistration,
} from "@/lib/auth/validation";

const validRegistration = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "engine1843",
  confirmPassword: "engine1843",
};

describe("validateRegistration", () => {
  it("accepts valid input", () => {
    expect(validateRegistration(validRegistration)).toEqual({});
  });

  it("requires every field", () => {
    expect(
      validateRegistration({ name: " ", email: "", password: "", confirmPassword: "" }),
    ).toEqual({
      name: "Name is required.",
      email: "Email is required.",
      password: "Password is required.",
      confirmPassword: "Please confirm your password.",
    });
  });

  it.each(["plainaddress", "no-at.example.com", "a@b", "a b@example.com", "a@@example.com"])(
    "rejects invalid email %s",
    (email) => {
      expect(validateRegistration({ ...validRegistration, email }).email).toBe(
        "Enter a valid email address.",
      );
    },
  );

  it("rejects short passwords and passwords without a letter and a number", () => {
    const short = validateRegistration({
      ...validRegistration,
      password: "a1",
      confirmPassword: "a1",
    });
    expect(short.password).toMatch(/at least 8 characters/);

    const lettersOnly = validateRegistration({
      ...validRegistration,
      password: "onlyletters",
      confirmPassword: "onlyletters",
    });
    expect(lettersOnly.password).toMatch(/letter and one number/);
  });

  it("rejects mismatched password confirmation", () => {
    expect(
      validateRegistration({ ...validRegistration, confirmPassword: "engine1844" })
        .confirmPassword,
    ).toBe("Passwords do not match.");
  });

  it("rejects overly long names and passwords", () => {
    const long = "a1".repeat(65);
    const errors = validateRegistration({
      ...validRegistration,
      name: "x".repeat(101),
      password: long,
      confirmPassword: long,
    });
    expect(errors.name).toMatch(/at most 100/);
    expect(errors.password).toMatch(/at most 128/);
  });
});

describe("validateLogin", () => {
  it("accepts valid input", () => {
    expect(validateLogin({ email: "ada@example.com", password: "x" })).toEqual({});
  });

  it("requires a valid email and a password", () => {
    expect(validateLogin({ email: "nope", password: "" })).toEqual({
      email: "Enter a valid email address.",
      password: "Password is required.",
    });
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Ada@Example.COM ")).toBe("ada@example.com");
  });
});

describe("safeRedirectPath", () => {
  it("allows same-site relative paths", () => {
    expect(safeRedirectPath("/wishlist")).toBe("/wishlist");
    expect(safeRedirectPath("/orders/5?tab=items")).toBe("/orders/5?tab=items");
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\t/evil.example",
    "/\n/evil.example",
    "/ /evil.example",
    "javascript:alert(1)",
    "wishlist",
    "/login",
    "/register?next=/x",
  ])("falls back for unsafe or looping target %s", (next) => {
    expect(safeRedirectPath(next)).toBe("/");
  });

  it("falls back for non-strings", () => {
    expect(safeRedirectPath(null, "/home")).toBe("/home");
  });
});

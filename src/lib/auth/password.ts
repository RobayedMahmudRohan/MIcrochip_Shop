import "server-only";

import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// scrypt parameters from the OWASP Password Storage Cheat Sheet
// (N=2^15, r=8, p=3 ≈ 32 MiB per hash). They're stored in each hash so they
// can be raised later without invalidating existing passwords.
const N = 2 ** 15;
const R = 8;
const P = 3;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      keyLength,
      // scrypt needs 128 * N * r bytes; leave headroom above Node's 32 MiB default.
      { ...options, maxmem: 256 * options.N! * options.r! },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

// Format: scrypt$N$r$p$<salt base64>$<hash base64>
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await deriveKey(password, salt, KEY_LENGTH, { N, r: R, p: P });

  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, "base64");
  const params = { N: Number(n), r: Number(r), p: Number(p) };

  if (!Object.values(params).every(Number.isSafeInteger) || expected.length === 0) {
    return false;
  }

  const actual = await deriveKey(
    password,
    Buffer.from(saltB64, "base64"),
    expected.length,
    params,
  );

  return timingSafeEqual(actual, expected);
}

// Precomputed hash of a random throwaway password. Checking against it when an
// email isn't registered makes "unknown email" take as long as "wrong
// password", so response timing doesn't reveal which emails have accounts.
let dummyHash: Promise<string> | undefined;

export async function verifyAgainstDummyHash(password: string) {
  dummyHash ??= hashPassword(randomBytes(32).toString("hex"));
  await verifyPassword(password, await dummyHash);
  return false;
}

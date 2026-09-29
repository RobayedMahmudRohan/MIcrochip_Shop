"use server";

import { redirect } from "next/navigation";
import {
  hashPassword,
  verifyAgainstDummyHash,
  verifyPassword,
} from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import {
  hasErrors,
  normalizeEmail,
  safeRedirectPath,
  validateLogin,
  validateRegistration,
  type FieldErrors,
  type LoginFields,
  type RegisterFields,
} from "@/lib/auth/validation";
import {
  createUser,
  DuplicateEmailError,
  emailExists,
  findUserCredentialsByEmail,
} from "@/lib/data/users";

// Server API for authentication (Server Actions). Orchestrates validation,
// password hashing, persistence (src/lib/data) and sessions; contains no SQL.

// Returned to the form on failure. Only echoes back the non-secret fields so
// the form can repopulate them; passwords are never sent back.
export type AuthFormState<T> = {
  errors?: FieldErrors<T>;
  message?: string;
  fields?: { name?: string; email?: string };
};

const GENERIC_ERROR = "Something went wrong. Please try again.";
const INVALID_CREDENTIALS = "Invalid email or password.";
const DUPLICATE_EMAIL = "An account with this email already exists.";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// mysql2 errors carry the full interpolated SQL (which can include a password
// hash), so only the code and message are logged — never the form data.
function logError(context: string, error: unknown) {
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  console.error(context, { code, message });
}

export async function register(
  _prevState: AuthFormState<RegisterFields>,
  formData: FormData,
): Promise<AuthFormState<RegisterFields>> {
  const input: RegisterFields = {
    name: getString(formData, "name"),
    email: getString(formData, "email"),
    password: getString(formData, "password"),
    confirmPassword: getString(formData, "confirmPassword"),
  };
  const fields = { name: input.name, email: input.email };

  const errors = validateRegistration(input);
  if (hasErrors(errors)) return { errors, fields };

  const email = normalizeEmail(input.email);

  try {
    if (await emailExists(email)) {
      return { errors: { email: DUPLICATE_EMAIL }, fields };
    }

    const userId = await createUser({
      name: input.name.trim(),
      email,
      passwordHash: await hashPassword(input.password),
    });

    await createSession(userId);
  } catch (error) {
    // Two simultaneous sign-ups with the same email: the UNIQUE key wins.
    if (error instanceof DuplicateEmailError) {
      return { errors: { email: DUPLICATE_EMAIL }, fields };
    }
    logError("Registration failed:", error);
    return { message: GENERIC_ERROR, fields };
  }

  // redirect() throws, so it must stay outside the try/catch.
  redirect(safeRedirectPath(formData.get("next")));
}

export async function login(
  _prevState: AuthFormState<LoginFields>,
  formData: FormData,
): Promise<AuthFormState<LoginFields>> {
  const input: LoginFields = {
    email: getString(formData, "email"),
    password: getString(formData, "password"),
  };
  const fields = { email: input.email };

  const errors = validateLogin(input);
  if (hasErrors(errors)) return { errors, fields };

  try {
    const user = await findUserCredentialsByEmail(normalizeEmail(input.email));

    const valid = user
      ? await verifyPassword(input.password, user.password_hash)
      : await verifyAgainstDummyHash(input.password);

    // Same message whether the email or the password was wrong.
    if (!user || !valid) {
      return { message: INVALID_CREDENTIALS, fields };
    }

    await createSession(user.id);
  } catch (error) {
    logError("Login failed:", error);
    return { message: GENERIC_ERROR, fields };
  }

  redirect(safeRedirectPath(formData.get("next")));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

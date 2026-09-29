// Shared by the auth forms (client) and the auth Server Actions (server), so
// both sides enforce exactly the same rules. The server never trusts the
// client's result and always re-validates.

export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 255;
export const PASSWORD_MIN_LENGTH = 8;
// Caps hashing cost for absurdly long inputs.
export const PASSWORD_MAX_LENGTH = 128;

// Deliberately pragmatic: one "@", no spaces, a dot in the domain.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginFields = {
  email: string;
  password: string;
};

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateEmail(email: string): string | undefined {
  const normalized = normalizeEmail(email);

  if (!normalized) return "Email is required.";
  if (normalized.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(normalized)) {
    return "Enter a valid email address.";
  }
  return undefined;
}

export function validateRegistration(
  fields: RegisterFields,
): FieldErrors<RegisterFields> {
  const errors: FieldErrors<RegisterFields> = {};
  const name = fields.name.trim();

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Name must be at most ${NAME_MAX_LENGTH} characters.`;
  }

  const emailError = validateEmail(fields.email);
  if (emailError) errors.email = emailError;

  if (!fields.password) {
    errors.password = "Password is required.";
  } else if (fields.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  } else if (fields.password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;
  } else if (!/[a-zA-Z]/.test(fields.password) || !/[0-9]/.test(fields.password)) {
    errors.password = "Password must contain at least one letter and one number.";
  }

  if (!fields.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (fields.confirmPassword !== fields.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function validateLogin(fields: LoginFields): FieldErrors<LoginFields> {
  const errors: FieldErrors<LoginFields> = {};

  const emailError = validateEmail(fields.email);
  if (emailError) errors.email = emailError;

  if (!fields.password) {
    errors.password = "Password is required.";
  } else if (fields.password.length > PASSWORD_MAX_LENGTH) {
    // Can't be a real password; fail like any other wrong credential.
    errors.password = `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;
  }

  return errors;
}

export function hasErrors(errors: object) {
  return Object.keys(errors).length > 0;
}

// Only same-site relative paths are allowed as post-login redirects, to
// prevent open redirects like `?next=https://evil.example` or `//evil.example`.
export function safeRedirectPath(
  next: unknown,
  fallback = "/",
): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  // Browsers strip tabs/newlines and treat "\" as "/", so "/\t/evil.example"
  // or "/\evil.example" would become protocol-relative external URLs.
  if (/[\x00-\x20\x7f\\]/.test(next)) return fallback;
  // Don't bounce back into the auth pages themselves.
  if (/^\/(login|register)(\/|\?|#|$)/.test(next)) return fallback;
  return next;
}

"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { register, type AuthFormState } from "@/lib/auth/actions";
import {
  PASSWORD_MIN_LENGTH,
  hasErrors,
  validateRegistration,
  type FieldErrors,
  type RegisterFields,
} from "@/lib/auth/validation";
import { FormField, FormMessage, submitButtonClass } from "@/components/auth/form-field";

const initialState: AuthFormState<RegisterFields> = {};

export function RegisterForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(register, initialState);
  const [clientErrors, setClientErrors] = useState<FieldErrors<RegisterFields>>({});

  // Client-side check for instant feedback; the server re-validates anyway.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const errors = validateRegistration({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      confirmPassword: String(data.get("confirmPassword") ?? ""),
    });

    setClientErrors(errors);
    if (hasErrors(errors)) {
      event.preventDefault();
      const firstInvalid = Object.keys(errors)[0];
      event.currentTarget.querySelector<HTMLInputElement>(`#${firstInvalid}`)?.focus();
    }
  }

  const errors = hasErrors(clientErrors) ? clientErrors : (state.errors ?? {});
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormMessage message={state.message} />

      {next && <input type="hidden" name="next" value={next} />}

      <FormField
        id="name"
        label="Name"
        type="text"
        autoComplete="name"
        required
        maxLength={100}
        defaultValue={state.fields?.name}
        error={errors.name}
      />
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        maxLength={255}
        defaultValue={state.fields?.email}
        error={errors.email}
      />
      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        hint={`At least ${PASSWORD_MIN_LENGTH} characters, with a letter and a number.`}
        error={errors.password}
      />
      <FormField
        id="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
      />

      <button type="submit" disabled={pending} aria-busy={pending} className={submitButtonClass}>
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={loginHref} className="font-medium text-primary hover:text-primary-hover">
          Log in
        </Link>
      </p>
    </form>
  );
}

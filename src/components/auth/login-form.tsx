"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { login, type AuthFormState } from "@/lib/auth/actions";
import {
  hasErrors,
  validateLogin,
  type FieldErrors,
  type LoginFields,
} from "@/lib/auth/validation";
import { FormField, FormMessage, submitButtonClass } from "@/components/auth/form-field";

const initialState: AuthFormState<LoginFields> = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [clientErrors, setClientErrors] = useState<FieldErrors<LoginFields>>({});

  // Client-side check for instant feedback; the server re-validates anyway.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const errors = validateLogin({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    });

    setClientErrors(errors);
    if (hasErrors(errors)) {
      event.preventDefault();
      const firstInvalid = Object.keys(errors)[0];
      event.currentTarget.querySelector<HTMLInputElement>(`#${firstInvalid}`)?.focus();
    }
  }

  const errors = hasErrors(clientErrors) ? clientErrors : (state.errors ?? {});
  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : "/register";

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormMessage message={state.message} />

      {next && <input type="hidden" name="next" value={next} />}

      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.fields?.email}
        error={errors.email}
      />
      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password}
      />

      <button type="submit" disabled={pending} aria-busy={pending} className={submitButtonClass}>
        {pending ? "Logging in…" : "Log in"}
      </button>

      <p className="text-center text-sm text-muted">
        New to Microchip Shop?{" "}
        <Link href={registerHref} className="font-medium text-primary hover:text-primary-hover">
          Create an account
        </Link>
      </p>
    </form>
  );
}

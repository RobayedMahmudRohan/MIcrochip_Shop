"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { logout } from "@/lib/auth/actions";

type LogoutButtonProps = {
  className: string;
  children?: ReactNode;
  pendingLabel?: ReactNode;
};

function SubmitButton({
  className,
  children = "Logout",
  pendingLabel = "Logging out…",
}: LogoutButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}

// A POST form (not a link), so logout can't be triggered by a prefetch or a
// cross-site GET. Server Actions also verify the request's Origin.
export function LogoutButton(props: LogoutButtonProps) {
  return (
    <form action={logout}>
      <SubmitButton {...props} />
    </form>
  );
}

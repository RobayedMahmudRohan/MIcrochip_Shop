"use client";

import { useFormStatus } from "react-dom";
import { logout } from "@/lib/auth/actions";

function SubmitButton({ className }: { className: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={className}>
      {pending ? "Logging out…" : "Logout"}
    </button>
  );
}

// A POST form (not a link), so logout can't be triggered by a prefetch or a
// cross-site GET. Server Actions also verify the request's Origin.
export function LogoutButton({ className }: { className: string }) {
  return (
    <form action={logout}>
      <SubmitButton className={className} />
    </form>
  );
}

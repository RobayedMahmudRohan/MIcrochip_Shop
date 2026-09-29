import "server-only";

import { notFound, redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "@/lib/auth/session";

// Authorization guards for pages and Server Actions. Checks run on the server
// on every request; UI visibility is never relied on for protection.

// Call at the top of any page or Server Action that needs a signed-in user.
// `returnTo` is where the login page sends the user back afterwards.
export async function requireUser(returnTo: string): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return user;
}

// Admin area: signed-out visitors go to login; signed-in non-admins get a 404
// so the admin pages' existence isn't advertised.
export async function requireAdmin(returnTo: string): Promise<SessionUser> {
  const user = await requireUser(returnTo);

  if (user.role !== "admin") {
    notFound();
  }
  return user;
}

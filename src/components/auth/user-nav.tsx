import Link from "next/link";
import { ProfileDrawer } from "@/components/auth/profile-drawer";
import { getCurrentUser } from "@/lib/auth/session";
import { findUserEmailById } from "@/lib/data/users";

const linkClass =
  "inline-block py-1 text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

// Rendered as <li> items inside the header's nav list.
export async function UserNav() {
  const user = await getCurrentUser();

  if (!user) {
    // Registration is reached from the login page's "Create an account" link.
    return (
      <li>
        <Link href="/login" className={linkClass}>
          Login
        </Link>
      </li>
    );
  }

  // getCurrentUser() deliberately omits the email; the drawer shows it to its
  // owner only.
  const email = await findUserEmailById(user.id);

  return (
    <li>
      <ProfileDrawer name={user.name} email={email} />
    </li>
  );
}

// Same footprint as the logged-out links, shown while the session is checked.
export function UserNavFallback() {
  return (
    <li aria-hidden className="h-5 w-24 animate-pulse rounded bg-border/60" />
  );
}

import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentUser } from "@/lib/auth/session";

const linkClass =
  "inline-block py-1 text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60";

// Rendered as <li> items inside the header's nav list.
export async function UserNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <li>
          <Link href="/login" className={linkClass}>
            Login
          </Link>
        </li>
        <li>
          <Link href="/register" className={linkClass}>
            Register
          </Link>
        </li>
      </>
    );
  }

  const firstName = user.name.trim().split(/\s+/)[0];

  return (
    <>
      <li>
        <Link href="/profile" className={linkClass}>
          Hi, <span className="text-foreground">{firstName}</span>
        </Link>
      </li>
      <li>
        <LogoutButton className={`${linkClass} cursor-pointer`} />
      </li>
    </>
  );
}

// Same footprint as the logged-out links, shown while the session is checked.
export function UserNavFallback() {
  return (
    <li aria-hidden className="h-5 w-24 animate-pulse rounded bg-border/60" />
  );
}

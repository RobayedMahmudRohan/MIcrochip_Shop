import Link from "next/link";
import { Suspense } from "react";
import { UserNav, UserNavFallback } from "@/components/auth/user-nav";
import { SearchBar } from "@/components/search-bar";

const navLinks = [
  { href: "/custom-build", label: "Custom Build" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/cart", label: "Cart" },
] as const;

export function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-primary" />
          Microchip Shop
        </Link>
        <div className="flex flex-1 sm:justify-center">
          <SearchBar />
        </div>
        <nav aria-label="Main navigation" className="shrink-0">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium sm:gap-x-5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block py-1 text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <Suspense fallback={<UserNavFallback />}>
              <UserNav />
            </Suspense>
          </ul>
        </nav>
      </div>
    </header>
  );
}

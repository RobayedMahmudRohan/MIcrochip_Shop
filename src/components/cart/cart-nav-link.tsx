"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

// The header's Cart link, with a badge counting the units in the cart. The
// count only appears after hydration, since the cart lives in the browser.
export function CartNavLink({ className }: { className: string }) {
  const lines = useCart();
  const count = (lines ?? []).reduce((sum, line) => sum + line.quantity, 0);
  const label = count === 1 ? "1 item" : `${count} items`;

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${label}` : undefined}
      className={`${className} inline-flex items-center gap-1.5`}
    >
      Cart
      {count > 0 ? (
        <span
          aria-hidden
          className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

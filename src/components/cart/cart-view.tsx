"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { ButtonLink } from "@/components/button-link";
import { formatPrice, ProductImage } from "@/components/product-card";
import {
  MAX_QUANTITY,
  removeFromCart,
  setCartQuantity,
  useCart,
  type CartLine,
} from "@/lib/cart";
import type { HomeProduct } from "@/lib/products";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

// Money is summed in whole paisa to avoid floating-point drift.
function toPaisa(price: string) {
  return Math.round(Number(price) * 100);
}

function paisaToPrice(paisa: number) {
  return formatPrice((paisa / 100).toFixed(2));
}

function Icon({ children, className = "h-4 w-4" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

type Loaded = { products: Map<number, HomeProduct>; failedKey: string | null };

export function CartView() {
  const lines = useCart();
  const [loaded, setLoaded] = useState<Loaded>({ products: new Map(), failedKey: null });
  const [attempt, setAttempt] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Products in the cart we don't have server data for yet.
  const missingIds = (lines ?? [])
    .map((line) => line.productId)
    .filter((id) => !loaded.products.has(id));
  const missingKey = missingIds.join(",");
  const failed = missingKey !== "" && loaded.failedKey === missingKey;
  const loading = lines === null || (missingKey !== "" && !failed);

  useEffect(() => {
    if (missingKey === "") return;
    const controller = new AbortController();

    fetch(`/api/cart/products?ids=${missingKey}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const { products } = (await response.json()) as { products: HomeProduct[] };

        setLoaded((previous) => {
          const next = new Map(previous.products);
          for (const product of products) next.set(product.id, product);
          return { products: next, failedKey: null };
        });

        // Products that no longer exist can't be bought; drop them.
        const found = new Set(products.map((product) => product.id));
        const gone = missingKey.split(",").map(Number).filter((id) => !found.has(id));
        if (gone.length > 0) removeFromCart(...gone);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Loading cart failed:", error);
        setLoaded((previous) => ({ ...previous, failedKey: missingKey }));
      });

    return () => controller.abort();
  }, [missingKey, attempt]);

  function retry() {
    setLoaded((previous) => ({ ...previous, failedKey: null }));
    setAttempt((count) => count + 1);
  }

  function changeQuantity(product: HomeProduct, quantity: number) {
    setCartQuantity(product.id, quantity);
    setAnnouncement(`${product.name} quantity updated to ${quantity}.`);
  }

  function remove(product: HomeProduct) {
    removeFromCart(product.id);
    setAnnouncement(`${product.name} removed from your cart.`);
    // The focused Remove button is gone; move focus somewhere stable.
    headingRef.current?.focus();
  }

  const items = (lines ?? []).flatMap((line) => {
    const product = loaded.products.get(line.productId);
    return product ? [{ line, product }] : [];
  });

  let content: ReactNode;
  if (lines !== null && lines.length === 0) {
    content = <EmptyCart />;
  } else if (failed) {
    content = (
      <div
        role="alert"
        className="rounded-lg border border-error/40 bg-error/5 p-6 text-center"
      >
        <p className="font-medium text-foreground">We couldn&apos;t load your cart.</p>
        <p className="mt-1 text-sm text-muted">
          Check your connection and try again. Your items are still saved.
        </p>
        <button
          type="button"
          onClick={retry}
          className={`mt-4 cursor-pointer rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary ${focusRing}`}
        >
          Try again
        </button>
      </div>
    );
  } else if (loading) {
    content = <CartSkeleton count={lines?.length || 2} />;
  } else {
    content = (
      <CartContents
        items={items}
        headingRef={headingRef}
        onQuantityChange={changeQuantity}
        onRemove={remove}
      />
    );
  }

  return (
    <>
      <div aria-busy={loading}>{content}</div>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}

type Item = { line: CartLine; product: HomeProduct };

function CartContents({
  items,
  headingRef,
  onQuantityChange,
  onRemove,
}: {
  items: Item[];
  headingRef: RefObject<HTMLHeadingElement | null>;
  onQuantityChange: (product: HomeProduct, quantity: number) => void;
  onRemove: (product: HomeProduct) => void;
}) {
  const subtotal = items.reduce(
    (sum, { line, product }) => sum + toPaisa(product.price) * line.quantity,
    0,
  );
  const itemCount = items.reduce((sum, { line }) => sum + line.quantity, 0);
  const hasUnavailable = items.some(({ product }) => !product.in_stock);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section aria-labelledby="cart-items-heading" className="min-w-0">
        <h2
          id="cart-items-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-sm font-medium text-muted focus:outline-none"
        >
          {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
        </h2>

        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface">
          <div
            aria-hidden
            className="hidden grid-cols-[minmax(0,1fr)_8.5rem_7rem_2.5rem] gap-4 border-b border-border px-5 py-3 text-xs font-medium tracking-wide text-muted uppercase sm:grid"
          >
            <span>Product</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
            <span />
          </div>
          <ul className="divide-y divide-border">
            {items.map(({ line, product }) => (
              <CartRow
                key={product.id}
                line={line}
                product={product}
                onQuantityChange={onQuantityChange}
                onRemove={onRemove}
              />
            ))}
          </ul>
        </div>
      </section>

      <aside
        aria-labelledby="order-summary-heading"
        className="rounded-lg border border-border bg-surface p-6 lg:sticky lg:top-6"
      >
        <h2 id="order-summary-heading" className="text-lg font-semibold text-foreground">
          Order Summary
        </h2>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
            </dt>
            <dd className="font-medium text-foreground tabular-nums">{paisaToPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Shipping</dt>
            <dd className="text-right text-foreground">Calculated at checkout</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-border pt-4">
            <dt className="text-base font-semibold text-foreground">Total</dt>
            <dd className="text-xl font-semibold text-foreground tabular-nums">
              {paisaToPrice(subtotal)}
            </dd>
          </div>
        </dl>

        {hasUnavailable ? (
          <>
            <button
              type="button"
              disabled
              aria-describedby="checkout-blocked"
              className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground opacity-50"
            >
              Proceed to Checkout
            </button>
            <p id="checkout-blocked" className="mt-2 text-sm text-error">
              Remove unavailable items to continue.
            </p>
          </>
        ) : (
          <Link
            href="/checkout"
            className={`mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover ${focusRing}`}
          >
            Proceed to Checkout
          </Link>
        )}
      </aside>
    </div>
  );
}

function CartRow({
  line,
  product,
  onQuantityChange,
  onRemove,
}: {
  line: CartLine;
  product: HomeProduct;
  onQuantityChange: (product: HomeProduct, quantity: number) => void;
  onRemove: (product: HomeProduct) => void;
}) {
  const lineTotal = toPaisa(product.price) * line.quantity;
  const stepButton = `flex h-10 w-10 cursor-pointer items-center justify-center text-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-foreground ${focusRing}`;

  return (
    <li className="flex flex-col gap-4 p-4 sm:grid sm:grid-cols-[minmax(0,1fr)_8.5rem_7rem_2.5rem] sm:items-center sm:gap-4 sm:px-5">
      <div className="flex min-w-0 gap-4">
        <Link
          href={`/products/${product.id}`}
          tabIndex={-1}
          aria-hidden
          className="shrink-0 self-start overflow-hidden rounded-md border border-border"
        >
          <ProductImage product={product} className="h-18 w-18 text-xs sm:h-20 sm:w-20" />
        </Link>
        <div className="min-w-0">
          <span className="text-xs font-medium tracking-wide text-accent uppercase">
            {product.category}
          </span>
          <h3 className="font-semibold text-foreground">
            <Link
              href={`/products/${product.id}`}
              className={`rounded-sm hover:text-primary ${focusRing}`}
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-muted tabular-nums">
            {formatPrice(product.price)} each
          </p>
          <p
            className={`mt-0.5 text-xs font-medium ${product.in_stock ? "text-success" : "text-error"}`}
          >
            {product.in_stock ? "In stock" : "Out of stock"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:contents">
        <div
          role="group"
          aria-label={`Quantity for ${product.name}`}
          className="flex w-fit items-center rounded-lg border border-border bg-surface sm:justify-self-center"
        >
          <button
            type="button"
            onClick={() => onQuantityChange(product, line.quantity - 1)}
            disabled={line.quantity <= 1}
            aria-label={`Decrease quantity of ${product.name}`}
            className={`${stepButton} rounded-l-lg`}
          >
            <Icon>
              <path d="M5 12h14" />
            </Icon>
          </button>
          <span className="w-9 text-center text-sm font-medium text-foreground tabular-nums">
            {line.quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(product, line.quantity + 1)}
            disabled={line.quantity >= MAX_QUANTITY}
            aria-label={`Increase quantity of ${product.name}`}
            className={`${stepButton} rounded-r-lg`}
          >
            <Icon>
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </Icon>
          </button>
        </div>

        <p className="ml-auto text-right font-semibold text-foreground tabular-nums sm:ml-0">
          <span className="sr-only">Item total: </span>
          {paisaToPrice(lineTotal)}
        </p>

        <button
          type="button"
          onClick={() => onRemove(product)}
          aria-label={`Remove ${product.name} from cart`}
          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-error/10 hover:text-error sm:justify-self-end ${focusRing}`}
        >
          <Icon className="h-5 w-5">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </Icon>
        </button>
      </div>
    </li>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-surface px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background text-muted">
        <Icon className="h-7 w-7">
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </Icon>
      </span>
      <h2 className="mt-5 text-xl font-semibold text-foreground">Your cart is empty</h2>
      <p className="mt-2 max-w-sm text-muted">
        Looks like you haven&apos;t added any components yet.
      </p>
      <ButtonLink href="/" className="mt-6">
        Browse Products
      </ButtonLink>
    </div>
  );
}

function CartSkeleton({ count }: { count: number }) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <p className="sr-only">Loading your cart…</p>
      <div aria-hidden className="divide-y divide-border rounded-lg border border-border bg-surface">
        {Array.from({ length: Math.min(count, 4) }, (_, index) => (
          <div key={index} className="flex animate-pulse gap-4 p-4 sm:px-5">
            <div className="h-18 w-18 shrink-0 rounded-md bg-border/60 sm:h-20 sm:w-20" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-20 rounded bg-border/60" />
              <div className="h-4 w-2/3 rounded bg-border/60" />
              <div className="h-3 w-24 rounded bg-border/60" />
            </div>
          </div>
        ))}
      </div>
      <div aria-hidden className="h-64 animate-pulse rounded-lg border border-border bg-surface" />
    </div>
  );
}

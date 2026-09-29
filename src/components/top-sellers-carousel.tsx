"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeProduct } from "@/lib/products";
import { formatPrice, ProductImage } from "@/components/product-card";

const AUTOPLAY_MS = 5000;

export function TopSellersCarousel({ products }: { products: HomeProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;

      const next = (index + products.length) % products.length;
      track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
    },
    [products.length],
  );

  // Keep the active dot in sync with manual swipes/scrolls.
  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (paused || reducedMotion || products.length < 2) return;

    const timer = setInterval(() => goTo(active + 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [active, paused, goTo, products.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Top selling products"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-lg border border-border bg-surface [scrollbar-width:none]"
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${products.length}`}
            className="w-full shrink-0 snap-start"
          >
            <Link
              href={`/products/${product.id}`}
              className="grid h-full gap-6 p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:grid-cols-2 sm:items-center sm:p-10"
            >
              <ProductImage
                product={product}
                className="aspect-4/3 w-full rounded-lg"
              />
              <div>
                <span className="text-sm font-medium tracking-wide text-accent uppercase">
                  Top seller · {product.category}
                </span>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="mt-3 line-clamp-3 text-muted">
                    {product.description}
                  </p>
                )}
                <div className="mt-5 flex items-center gap-4">
                  <span className="text-xl font-semibold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  <span
                    className={`text-sm font-medium ${product.in_stock ? "text-success" : "text-muted"}`}
                  >
                    {product.in_stock ? "Available" : "Not available"}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {products.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous product"
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            ←
          </button>

          <div className="flex gap-2">
            {products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to product ${index + 1}`}
                aria-current={index === active}
                className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${index === active ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted"}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next product"
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}

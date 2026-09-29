"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { HomeProduct } from "@/lib/products";
import { formatPrice } from "@/components/product-card";

const DEBOUNCE_MS = 200;
const MIN_QUERY_LENGTH = 2;

type Status = "idle" | "loading" | "done" | "error";

export function SearchBar() {
  const router = useRouter();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HomeProduct[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const trimmed = query.trim();
  const showDropdown = open && trimmed.length >= MIN_QUERY_LENGTH;

  // Debounced live search; stale requests are aborted.
  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Search failed");

        const data: { products: HomeProduct[] } = await response.json();
        setResults(data.products);
        setHighlighted(-1);
        setStatus("done");
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setStatus("error");
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  // Close when clicking outside the search box.
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function openProduct(product: HomeProduct) {
    setOpen(false);
    setQuery("");
    setResults([]);
    setStatus("idle");
    router.push(`/products/${product.id}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!showDropdown || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === "Enter" && highlighted >= 0) {
      // A highlighted suggestion opens directly; otherwise Enter submits the
      // form like the Search button.
      event.preventDefault();
      openProduct(results[highlighted]);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmed) return;

    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div ref={containerRef} className="relative w-full sm:max-w-sm">
      <form role="search" onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products…"
          aria-label="Search products"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            highlighted >= 0 ? `${listId}-${highlighted}` : undefined
          }
          className="w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {status === "loading" && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted">Searching…</p>
          )}
          {status === "error" && (
            <p className="px-3 py-2 text-sm text-error">
              Search isn&apos;t working right now. Please try again.
            </p>
          )}
          {status === "done" && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted">
              No products match &quot;{trimmed}&quot;.
            </p>
          )}

          {results.length > 0 && status !== "error" && (
            <ul id={listId} role="listbox" className="max-h-96 overflow-y-auto">
              {results.map((product, index) => (
                <li
                  key={product.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === highlighted}
                  onPointerEnter={() => setHighlighted(index)}
                  onClick={() => openProduct(product)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${index === highlighted ? "bg-background" : ""}`}
                >
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded object-contain"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded bg-background" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {product.category}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

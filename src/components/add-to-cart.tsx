"use client";

import { useState } from "react";

const MAX_QUANTITY = 99;

// UI only for now: the cart isn't built yet, so the button just says so.
export function AddToCart({ inStock }: { inStock: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState(false);

  function changeQuantity(value: number) {
    if (Number.isNaN(value)) return;
    setQuantity(Math.min(MAX_QUANTITY, Math.max(1, value)));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <label htmlFor="quantity" className="font-medium text-foreground">
          Quantity
        </label>

        <div className="flex items-center rounded-lg border border-border bg-surface">
          <button
            type="button"
            onClick={() => changeQuantity(quantity - 1)}
            disabled={!inStock || quantity <= 1}
            aria-label="Decrease quantity"
            className="px-3 py-2 text-foreground transition-colors hover:text-primary disabled:opacity-40"
          >
            −
          </button>
          <input
            id="quantity"
            type="number"
            min={1}
            max={MAX_QUANTITY}
            value={quantity}
            disabled={!inStock}
            onChange={(event) => changeQuantity(event.target.valueAsNumber)}
            className="w-12 bg-transparent py-2 text-center text-foreground [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => changeQuantity(quantity + 1)}
            disabled={!inStock || quantity >= MAX_QUANTITY}
            aria-label="Increase quantity"
            className="px-3 py-2 text-foreground transition-colors hover:text-primary disabled:opacity-40"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => setNotice(true)}
          disabled={!inStock}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {inStock ? "Add to cart" : "Out of stock"}
        </button>
      </div>

      <p role="status" className="mt-2 min-h-5 text-sm text-muted">
        {notice && "The cart isn't available yet — coming soon."}
      </p>
    </div>
  );
}

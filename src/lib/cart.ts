"use client";

import { useSyncExternalStore } from "react";

// The shopping cart. It lives in this browser's localStorage so guests can
// shop without an account, and holds only product ids and quantities; names,
// prices and availability are always loaded fresh from the server.

export type CartLine = { productId: number; quantity: number };

export const MAX_QUANTITY = 99;

const STORAGE_KEY = "microchip-shop:cart";

let lines: CartLine[] | null = null;
const listeners = new Set<() => void>();

function clamp(quantity: number) {
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)));
}

function parse(raw: string | null): CartLine[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.flatMap((line) => {
      const { productId, quantity } = (line ?? {}) as Partial<CartLine>;
      return Number.isInteger(productId) && productId! > 0 && Number.isFinite(quantity)
        ? [{ productId: productId!, quantity: clamp(quantity!) }]
        : [];
    });
  } catch {
    return [];
  }
}

function read(): CartLine[] {
  if (lines === null) {
    try {
      lines = parse(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      lines = [];
    }
  }
  return lines;
}

function write(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked or full: the cart still works for this page session.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Keep tabs in sync: another tab changed the cart.
  function onStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    lines = null;
    listener();
  }
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// The cart lines, or null during server rendering and hydration, when the
// browser's cart isn't known yet.
export function useCart(): CartLine[] | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function addToCart(productId: number, quantity: number) {
  const current = read();
  const existing = current.find((line) => line.productId === productId);

  write(
    existing
      ? current.map((line) =>
          line.productId === productId
            ? { ...line, quantity: clamp(line.quantity + quantity) }
            : line,
        )
      : [...current, { productId, quantity: clamp(quantity) }],
  );
}

export function setCartQuantity(productId: number, quantity: number) {
  write(
    read().map((line) =>
      line.productId === productId ? { ...line, quantity: clamp(quantity) } : line,
    ),
  );
}

export function removeFromCart(...productIds: number[]) {
  write(read().filter((line) => !productIds.includes(line.productId)));
}

// Test helper: forget the in-memory copy so the next read hits storage.
export function resetCartCache() {
  lines = null;
}

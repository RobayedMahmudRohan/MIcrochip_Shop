import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  addToCart,
  MAX_QUANTITY,
  removeFromCart,
  resetCartCache,
  setCartQuantity,
  useCart,
} from "@/lib/cart";

const KEY = "microchip-shop:cart";

function stored() {
  return JSON.parse(localStorage.getItem(KEY) ?? "null");
}

beforeEach(() => {
  localStorage.clear();
  resetCartCache();
});

describe("cart store", () => {
  it("adds products, merging repeat adds into one line", () => {
    addToCart(1, 2);
    addToCart(2, 1);
    addToCart(1, 3);

    expect(stored()).toEqual([
      { productId: 1, quantity: 5 },
      { productId: 2, quantity: 1 },
    ]);
  });

  it("keeps quantities between 1 and the maximum", () => {
    addToCart(1, 1);
    setCartQuantity(1, 0);
    expect(stored()).toEqual([{ productId: 1, quantity: 1 }]);

    setCartQuantity(1, 500);
    expect(stored()).toEqual([{ productId: 1, quantity: MAX_QUANTITY }]);

    addToCart(1, 5);
    expect(stored()).toEqual([{ productId: 1, quantity: MAX_QUANTITY }]);
  });

  it("removes products", () => {
    addToCart(1, 1);
    addToCart(2, 1);
    removeFromCart(1);

    expect(stored()).toEqual([{ productId: 2, quantity: 1 }]);
  });

  it("ignores corrupted or tampered storage", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify([{ productId: 3, quantity: 2 }, { productId: "x" }, null, { productId: -1, quantity: 1 }]),
    );
    const { result } = renderHook(() => useCart());
    expect(result.current).toEqual([{ productId: 3, quantity: 2 }]);

    resetCartCache();
    localStorage.setItem(KEY, "{not json");
    const { result: broken } = renderHook(() => useCart());
    expect(broken.current).toEqual([]);
  });

  it("re-renders subscribers when the cart changes", () => {
    const { result } = renderHook(() => useCart());
    expect(result.current).toEqual([]);

    act(() => addToCart(7, 2));

    expect(result.current).toEqual([{ productId: 7, quantity: 2 }]);
  });
});

import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CartNavLink } from "@/components/cart/cart-nav-link";
import { addToCart, removeFromCart, resetCartCache } from "@/lib/cart";

beforeEach(() => {
  localStorage.clear();
  resetCartCache();
});

describe("CartNavLink", () => {
  it("shows no badge while the cart is empty", () => {
    render(<CartNavLink className="" />);

    expect(screen.getByRole("link", { name: "Cart" })).toHaveAttribute("href", "/cart");
  });

  it("counts units in the cart and updates live", () => {
    addToCart(1, 2);
    render(<CartNavLink className="" />);
    expect(screen.getByRole("link", { name: "Cart, 2 items" })).toHaveTextContent("Cart2");

    act(() => addToCart(2, 1));
    expect(screen.getByRole("link", { name: "Cart, 3 items" })).toBeInTheDocument();

    act(() => removeFromCart(1, 2));
    expect(screen.getByRole("link", { name: "Cart" })).toHaveTextContent(/^Cart$/);
  });
});

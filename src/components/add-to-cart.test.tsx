import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { AddToCart } from "@/components/add-to-cart";
import { resetCartCache } from "@/lib/cart";

beforeEach(() => {
  localStorage.clear();
  resetCartCache();
});

describe("AddToCart", () => {
  it("adds the chosen quantity to the cart", async () => {
    const user = userEvent.setup();
    render(<AddToCart productId={5} inStock />);

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(JSON.parse(localStorage.getItem("microchip-shop:cart")!)).toEqual([
      { productId: 5, quantity: 2 },
    ]);
    expect(screen.getByRole("status")).toHaveTextContent("Added 2 to your cart.");
    expect(screen.getByRole("link", { name: "View cart" })).toHaveAttribute("href", "/cart");
  });

  it("can't add out-of-stock products", () => {
    render(<AddToCart productId={5} inStock={false} />);

    expect(screen.getByRole("button", { name: "Out of stock" })).toBeDisabled();
  });
});

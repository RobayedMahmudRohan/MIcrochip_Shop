import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartView } from "@/components/cart/cart-view";
import { addToCart, resetCartCache } from "@/lib/cart";
import type { HomeProduct } from "@/lib/products";

const uno: HomeProduct = {
  id: 1,
  name: "Arduino Uno R3",
  category: "Boards",
  description: null,
  price: "1250.00",
  image_url: null,
  in_stock: true,
};
const sensor: HomeProduct = {
  id: 2,
  name: "DHT22 Sensor",
  category: "Sensors",
  description: null,
  price: "450.50",
  image_url: null,
  in_stock: true,
};

const fetchMock = vi.fn();

function respondWith(products: HomeProduct[]) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ products })));
}

function summary() {
  return within(screen.getByRole("complementary", { name: "Order Summary" }));
}

beforeEach(() => {
  localStorage.clear();
  resetCartCache();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CartView", () => {
  it("shows the empty state with a link to products", () => {
    render(<CartView />);

    expect(screen.getByRole("heading", { name: "Your cart is empty" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse Products" })).toHaveAttribute("href", "/");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lists items with server prices and totals them", async () => {
    addToCart(1, 2);
    addToCart(2, 1);
    respondWith([uno, sensor]);

    render(<CartView />);

    expect(await screen.findByRole("link", { name: "Arduino Uno R3" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/cart/products?ids=1,2", expect.anything());
    // 2 × 1250.00 + 450.50
    expect(summary().getByText("Total").nextElementSibling).toHaveTextContent("৳2,950.50");
    expect(summary().getByText("Calculated at checkout")).toBeInTheDocument();
    expect(summary().getByRole("link", { name: "Proceed to Checkout" })).toHaveAttribute(
      "href",
      "/checkout",
    );
  });

  it("updates totals when quantities change, never below 1", async () => {
    addToCart(1, 1);
    respondWith([uno]);
    const user = userEvent.setup();
    render(<CartView />);

    const decrease = await screen.findByRole("button", { name: "Decrease quantity of Arduino Uno R3" });
    expect(decrease).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Increase quantity of Arduino Uno R3" }));
    await user.click(screen.getByRole("button", { name: "Increase quantity of Arduino Uno R3" }));

    expect(summary().getByText("Total").nextElementSibling).toHaveTextContent("৳3,750.00");
    expect(screen.getByRole("status")).toHaveTextContent("Arduino Uno R3 quantity updated to 3.");
    expect(decrease).toBeEnabled();

    await user.click(decrease);
    expect(summary().getByText("Total").nextElementSibling).toHaveTextContent("৳2,500.00");
    // Only the first load hits the server; quantity changes are instant.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("removes items and falls back to the empty state", async () => {
    addToCart(1, 1);
    respondWith([uno]);
    const user = userEvent.setup();
    render(<CartView />);

    await user.click(await screen.findByRole("button", { name: "Remove Arduino Uno R3 from cart" }));

    expect(screen.getByRole("heading", { name: "Your cart is empty" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Arduino Uno R3 removed from your cart.");
  });

  it("blocks checkout while an item is out of stock", async () => {
    addToCart(1, 1);
    respondWith([{ ...uno, in_stock: false }]);
    render(<CartView />);

    expect(await screen.findByText("Out of stock")).toBeInTheDocument();
    expect(summary().getByRole("button", { name: "Proceed to Checkout" })).toBeDisabled();
    expect(summary().getByText("Remove unavailable items to continue.")).toBeInTheDocument();
  });

  it("drops products that no longer exist", async () => {
    addToCart(1, 1);
    addToCart(99, 1);
    respondWith([uno]);
    render(<CartView />);

    expect(await screen.findByRole("link", { name: "Arduino Uno R3" })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("microchip-shop:cart")!)).toEqual([
      { productId: 1, quantity: 1 },
    ]);
  });

  it("shows an error with a working retry when loading fails", async () => {
    addToCart(1, 1);
    fetchMock.mockResolvedValueOnce(new Response("", { status: 500 }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<CartView />);

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't load your cart.");

    respondWith([uno]);
    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Arduino Uno R3" })).toBeInTheDocument();
  });
});

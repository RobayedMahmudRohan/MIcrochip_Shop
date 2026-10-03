import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductComparison } from "./product-comparison";

const products = [
  {
    name: "Arduino Uno R3",
    category: "Arduino",
    serialNumber: "ARD-UNO-R3",
    description: "ATmega328P development board",
    price: 1200,
    availability: "Available" as const,
  },
  {
    name: "Arduino Nano",
    category: "Arduino",
    serialNumber: "ARD-NANO",
    description: "Compact Arduino board",
    price: 950,
    availability: "Not available" as const,
  },
];

describe("ProductComparison", () => {
  it("shows products and comparison details", () => {
    render(<ProductComparison products={products} />);

    expect(screen.getByRole("table")).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: /Arduino Uno R3/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: /Arduino Nano/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("Availability")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();

    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Not available")).toBeInTheDocument();

    expect(screen.getByText("ATmega328P development board")).toBeInTheDocument();
    expect(screen.getByText("Compact Arduino board")).toBeInTheDocument();
  });

  it("shows an empty state when there are no products", () => {
    render(<ProductComparison products={[]} />);

    expect(
      screen.getByText("No matching products found"),
    ).toBeInTheDocument();
  });
});
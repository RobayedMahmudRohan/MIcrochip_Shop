import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductResults } from "./product-results";

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
    name: "HC-SR04",
    category: "Sensors",
    serialNumber: "SEN-HC-SR04",
    description: "Ultrasonic distance sensor",
    price: 250,
    availability: "Not available" as const,
  },
];

describe("ProductResults", () => {
  it("shows product results and their details", () => {
    render(
      <ProductResults
        query="Arduino"
        products={products}
        count={2}
      />,
    );

    expect(screen.getByText("Product results")).toBeInTheDocument();
    expect(screen.getByText('Found 2 products for "Arduino".')).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Arduino Uno R3" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "HC-SR04" })).toBeInTheDocument();

    expect(screen.getByText(/Serial:\s*ARD-UNO-R3/)).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Not available")).toBeInTheDocument();
  });

  it("shows an empty state when no products are found", () => {
    render(
      <ProductResults
        query="XYZ"
        products={[]}
        count={0}
      />,
    );

    expect(screen.getByText("No products found")).toBeInTheDocument();
    expect(
      screen.getByText('No products matched "XYZ".'),
    ).toBeInTheDocument();
  });
});
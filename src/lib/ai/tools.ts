import { tool } from "ai";
import { z } from "zod";

const products = [
  {
    name: "Arduino Uno R3",
    category: "Arduino Boards",
    serialNumber: "ARD-UNO-R3",
    description: "ATmega328P-based development board for electronics projects.",
  },
  {
    name: "Arduino Nano",
    category: "Arduino Boards",
    serialNumber: "ARD-NANO",
    description: "Compact Arduino board suitable for small embedded projects.",
  },
  {
    name: "ESP32 Development Board",
    category: "Microcontrollers",
    serialNumber: "ESP32-DEV",
    description: "Wi-Fi and Bluetooth enabled development board.",
  },
  {
    name: "HC-SR04 Ultrasonic Sensor",
    category: "Sensors",
    serialNumber: "SEN-HCSR04",
    description: "Ultrasonic distance sensor for Arduino and embedded projects.",
  },
];

export const searchProducts = tool({
  description:
    "Search the Microchip Shop product catalog by product name, category, or serial number.",

  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .describe("The product name, category, or serial number to search for."),
  }),

  execute: async ({ query }) => {
    const normalizedQuery = query.toLowerCase().trim();

    const results = products.filter((product) =>
      [
        product.name,
        product.category,
        product.serialNumber,
        product.description,
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );

    return {
      query,
      products: results,
      count: results.length,
    };
  },
});
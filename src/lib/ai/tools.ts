import { tool } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";

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

    const [rows] = await db.query(
      `
        SELECT
          p.name,
          c.name AS category,
          p.serial_number,
          p.description,
          p.price,
          p.stock_quantity
        FROM products p
        INNER JOIN categories c ON c.id = p.category_id
        WHERE
          LOWER(p.name) LIKE ?
          OR LOWER(c.name) LIKE ?
          OR LOWER(p.serial_number) LIKE ?
          OR LOWER(COALESCE(p.description, '')) LIKE ?
        ORDER BY p.id
      `,
      [
        `%${normalizedQuery}%`,
        `%${normalizedQuery}%`,
        `%${normalizedQuery}%`,
        `%${normalizedQuery}%`,
      ],
    );

    const products = (rows as Array<{
      name: string;
      category: string;
      serial_number: string;
      description: string | null;
      price: number;
      stock_quantity: number;
    }>).map((product) => ({
      name: product.name,
      category: product.category,
      serialNumber: product.serial_number,
      description: product.description,
      price: product.price,
      availability:
        product.stock_quantity > 0 ? "Available" : "Not available",
    }));

    return {
      query,
      products,
      count: products.length,
    };
  },
});
export const getCategorySummary = tool({
  description:
    "Get the number of products available in each Microchip Shop product category.",

  inputSchema: z.object({}),

  execute: async () => {
    const [rows] = await db.query(`
      SELECT
        c.name AS category,
        COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY c.id
    `);

    const categories = (
      rows as Array<{
        category: string;
        product_count: number;
      }>
    ).map((row) => ({
      category: row.category,
      productCount: Number(row.product_count),
    }));

    return {
      categories,
    };
  },
});
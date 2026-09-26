import { db } from "@/lib/db";

export type Product = {
  id: number;
  category_id: number;
  name: string;
  serial_number: string;
  description: string | null;
  price: number;
  stock_quantity: number;
};

export async function getProducts(): Promise<Product[]> {
  const [rows] = await db.query(`
    SELECT
      id,
      category_id,
      name,
      serial_number,
      description,
      price,
      stock_quantity
    FROM products
    ORDER BY id
  `);

  return rows as Product[];
}
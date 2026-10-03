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

// Storefront-safe shape: exact stock and cost price never leave the server.
export type HomeProduct = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  price: string;
  image_url: string | null;
  in_stock: boolean;
};

// Orders that count as a sale (unconfirmed and cancelled orders are ignored).
const SOLD_ORDER_STATUSES = `('confirmed', 'processing', 'ready_for_pickup', 'completed')`;

const HOME_PRODUCT_COLUMNS = `
  p.id,
  p.name,
  c.name AS category,
  p.description,
  p.price,
  (
    SELECT pi.image_url
    FROM product_images pi
    WHERE pi.product_id = p.id
    ORDER BY pi.is_primary DESC, pi.id
    LIMIT 1
  ) AS image_url,
  p.stock_quantity > 0 AS in_stock
`;

type HomeProductRow = Omit<HomeProduct, "in_stock"> & { in_stock: number };

function toHomeProducts(rows: unknown): HomeProduct[] {
  return (rows as HomeProductRow[]).map((row) => ({
    ...row,
    in_stock: Boolean(row.in_stock),
  }));
}

// Picks `count` random products from the all-time top `poolSize` sellers.
export async function getRandomTopSellingProducts(
  count = 10,
  poolSize = 20,
): Promise<HomeProduct[]> {
  const [rows] = await db.query(
    `
      SELECT top_sellers.*
      FROM (
        SELECT ${HOME_PRODUCT_COLUMNS}
        FROM order_items oi
        INNER JOIN orders o ON o.id = oi.order_id
        INNER JOIN products p ON p.id = oi.product_id
        INNER JOIN categories c ON c.id = p.category_id
        WHERE o.status IN ${SOLD_ORDER_STATUSES}
        GROUP BY p.id, c.name
        ORDER BY SUM(oi.quantity) DESC
        LIMIT ?
      ) AS top_sellers
      ORDER BY RAND()
      LIMIT ?
    `,
    [poolSize, count],
  );

  return toHomeProducts(rows);
}

// Best sellers by units sold in orders placed today (database time zone).
export async function getTopSellersOfTheDay(limit = 8): Promise<HomeProduct[]> {
  const [rows] = await db.query(
    `
      SELECT ${HOME_PRODUCT_COLUMNS}
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      INNER JOIN products p ON p.id = oi.product_id
      INNER JOIN categories c ON c.id = p.category_id
      WHERE o.status IN ${SOLD_ORDER_STATUSES}
        AND o.created_at >= CURDATE()
      GROUP BY p.id, c.name
      ORDER BY SUM(oi.quantity) DESC
      LIMIT ?
    `,
    [limit],
  );

  return toHomeProducts(rows);
}

export async function getAllProductsShuffled(): Promise<HomeProduct[]> {
  const [rows] = await db.query(`
    SELECT ${HOME_PRODUCT_COLUMNS}
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    ORDER BY RAND()
  `);

  return toHomeProducts(rows);
}

export type ProductDetails = {
  id: number;
  name: string;
  serial_number: string;
  category: string;
  description: string | null;
  price: string;
  in_stock: boolean;
};

export type ProductImage = {
  id: number;
  image_url: string;
};

export type ProductReview = {
  id: number;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: Date;
};

export type ProductReviewSummary = {
  average: number;
  count: number;
};

export async function getProductDetails(
  id: number,
): Promise<ProductDetails | null> {
  const [rows] = await db.query(
    `
      SELECT
        p.id,
        p.name,
        p.serial_number,
        c.name AS category,
        p.description,
        p.price,
        p.stock_quantity > 0 AS in_stock
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?
    `,
    [id],
  );

  const row = (rows as Array<Omit<ProductDetails, "in_stock"> & { in_stock: number }>)[0];
  return row ? { ...row, in_stock: Boolean(row.in_stock) } : null;
}

// Primary image first, then in upload order.
export async function getProductImages(id: number): Promise<ProductImage[]> {
  const [rows] = await db.query(
    `
      SELECT id, image_url
      FROM product_images
      WHERE product_id = ?
      ORDER BY is_primary DESC, id
    `,
    [id],
  );

  return rows as ProductImage[];
}

export async function getProductReviews(id: number): Promise<ProductReview[]> {
  const [rows] = await db.query(
    `
      SELECT
        r.id,
        u.name AS user_name,
        r.rating,
        r.comment,
        r.created_at
      FROM product_reviews r
      INNER JOIN users u ON u.id = r.user_id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `,
    [id],
  );

  return rows as ProductReview[];
}

export async function getProductReviewSummary(
  id: number,
): Promise<ProductReviewSummary> {
  const [rows] = await db.query(
    `
      SELECT
        COALESCE(AVG(rating), 0) AS average,
        COUNT(*) AS count
      FROM product_reviews
      WHERE product_id = ?
    `,
    [id],
  );

  const row = (rows as Array<{ average: string | number; count: number }>)[0];
  return { average: Number(row.average), count: Number(row.count) };
}

// Units of this product sold in the last `days` days.
export async function getRecentUnitsSold(id: number, days = 30): Promise<number> {
  const [rows] = await db.query(
    `
      SELECT COALESCE(SUM(oi.quantity), 0) AS units
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = ?
        AND o.status IN ${SOLD_ORDER_STATUSES}
        AND o.created_at >= NOW() - INTERVAL ? DAY
    `,
    [id, days],
  );

  return Number((rows as Array<{ units: string | number }>)[0].units);
}

// Header search: name matches rank above category/serial/description matches.
export async function searchStoreProducts(
  query: string,
  limit = 8,
): Promise<HomeProduct[]> {
  const pattern = `%${query.toLowerCase().trim()}%`;

  const [rows] = await db.query(
    `
      SELECT ${HOME_PRODUCT_COLUMNS}
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      WHERE
        LOWER(p.name) LIKE ?
        OR LOWER(c.name) LIKE ?
        OR LOWER(p.serial_number) LIKE ?
        OR LOWER(COALESCE(p.description, '')) LIKE ?
      ORDER BY LOWER(p.name) LIKE ? DESC, p.name
      LIMIT ?
    `,
    [pattern, pattern, pattern, pattern, pattern, limit],
  );

  return toHomeProducts(rows);
}

// Full search results page: products whose name contains any of the searched
// words (hyphens ignored, so "hc05" finds "HC-05"). Exact phrase matches
// come first, then names matching more words.
export async function searchProductsByName(
  query: string,
): Promise<HomeProduct[]> {
  const phrase = query.toLowerCase().replaceAll("-", "").trim();
  const name = "REPLACE(LOWER(p.name), '-', '')";
  const words = [...new Set(phrase.split(/\s+/).filter((word) => word.length >= 2))];

  if (words.length === 0) return [];

  const wordScore = words.map(() => `(${name} LIKE ?)`).join(" + ");
  const wordPatterns = words.map((word) => `%${word}%`);

  const [rows] = await db.query(
    `
      SELECT ${HOME_PRODUCT_COLUMNS}
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      WHERE ${wordScore} > 0
      ORDER BY
        ${name} LIKE ? DESC,
        ${wordScore} DESC,
        p.name
    `,
    [...wordPatterns, `%${phrase}%`, ...wordPatterns],
  );

  return toHomeProducts(rows);
}

// Current data for the products in a shopper's cart. Prices always come from
// here, never from the browser.
export async function getCartProducts(ids: number[]): Promise<HomeProduct[]> {
  if (ids.length === 0) return [];

  const [rows] = await db.query(
    `
      SELECT ${HOME_PRODUCT_COLUMNS}
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      WHERE p.id IN (?)
    `,
    [ids],
  );

  return toHomeProducts(rows);
}

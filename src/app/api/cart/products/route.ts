import { getCartProducts } from "@/lib/products";

const MAX_IDS = 100;

// GET /api/cart/products?ids=1,2,3 — storefront data for the cart page.
export async function GET(request: Request) {
  const ids = [
    ...new Set(
      (new URL(request.url).searchParams.get("ids") ?? "")
        .split(",")
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ].slice(0, MAX_IDS);

  try {
    const products = await getCartProducts(ids);
    return Response.json({ products });
  } catch (error) {
    console.error("Loading cart products failed:", error);
    return Response.json({ error: "Could not load cart products" }, { status: 500 });
  }
}

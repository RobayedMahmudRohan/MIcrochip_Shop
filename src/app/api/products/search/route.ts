import { searchStoreProducts } from "@/lib/products";

const MAX_QUERY_LENGTH = 100;

export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get("q") ?? "")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);

  if (query.length < 2) {
    return Response.json({ products: [] });
  }

  try {
    const products = await searchStoreProducts(query);
    return Response.json({ products });
  } catch (error) {
    console.error("Product search failed:", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}

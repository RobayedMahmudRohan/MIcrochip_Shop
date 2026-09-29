import { ProductCard } from "@/components/product-card";
import { searchProductsByName } from "@/lib/products";

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : (q ?? "")).trim().slice(0, 100);

  const products = query ? await searchProductsByName(query) : [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {query ? <>Search results for &quot;{query}&quot;</> : "Search"}
      </h1>

      {!query ? (
        <p className="mt-2 text-muted">
          Type a product name in the search bar above and press Search.
        </p>
      ) : products.length === 0 ? (
        <p className="mt-2 text-muted">
          No products with a name like &quot;{query}&quot;. Try fewer or
          different words.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">
            {products.length} product{products.length === 1 ? "" : "s"} found
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

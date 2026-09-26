import { getProducts } from "@/lib/products";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold">Products</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="rounded-lg border p-5"
          >
            <h2 className="text-lg font-semibold">{product.name}</h2>

            <p className="mt-2 text-sm text-gray-600">
              {product.description}
            </p>

            <p className="mt-3 text-sm">
              Serial: {product.serial_number}
            </p>

            <p className="mt-2 font-semibold">
              ${product.price}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {product.stock_quantity > 0
                ? "Available"
                : "Not available"}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
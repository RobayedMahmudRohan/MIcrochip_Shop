type Product = {
  name: string;
  category: string;
  serialNumber: string;
  description: string;
};

type ProductResultsProps = {
  query: string;
  products: Product[];
  count: number;
};

export function ProductResults({
  query,
  products,
  count,
}: ProductResultsProps) {
  if (count === 0) {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
        <p className="font-medium text-gray-900">No products found</p>
        <p className="mt-1 text-sm text-gray-600">
          No products matched &quot;{query}&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="font-medium text-gray-900">Product results</p>
        <p className="text-sm text-gray-600">
          Found {count} product{count === 1 ? "" : "s"} for &quot;{query}&quot;.
        </p>
      </div>

      <div className="grid gap-3">
        {products.map((product) => (
          <div
            key={product.serialNumber}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {product.name}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  {product.description}
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                {product.category}
              </span>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Serial: {product.serialNumber}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
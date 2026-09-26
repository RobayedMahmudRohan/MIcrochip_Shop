type Product = {
  name: string;
  category: string;
  serialNumber: string;
  description: string | null;
  price: number;
  availability: "Available" | "Not available";
};

type ProductComparisonProps = {
  products: Product[];
};

export function ProductComparison({
  products,
}: ProductComparisonProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="font-medium text-gray-900">
          No matching products found
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="w-40 px-4 py-4 text-left text-sm font-semibold text-gray-600">
              Feature
            </th>

            {products.map((product) => (
              <th
                key={product.serialNumber}
                className="min-w-[220px] px-4 py-4 text-left"
              >
                <div className="text-base font-bold text-gray-900">
                  {product.name}
                </div>

                <div className="mt-1 text-xs font-normal text-gray-500">
                  {product.serialNumber}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
              Category
            </th>

            {products.map((product) => (
              <td
                key={product.serialNumber}
                className="px-4 py-4 text-sm text-gray-800"
              >
                {product.category}
              </td>
            ))}
          </tr>

          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
              Price
            </th>

            {products.map((product) => (
              <td
                key={product.serialNumber}
                className="px-4 py-4 text-lg font-bold text-gray-900"
              >
               ৳{Number(product.price).toFixed(2)}
              </td>
            ))}
          </tr>

          <tr className="border-b border-gray-100">
            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600">
              Availability
            </th>

            {products.map((product) => (
              <td
                key={product.serialNumber}
                className="px-4 py-4"
              >
                <span
                  className={
                    product.availability === "Available"
                      ? "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                      : "inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                  }
                >
                  {product.availability}
                </span>
              </td>
            ))}
          </tr>

          <tr>
            <th className="px-4 py-4 text-left align-top text-sm font-semibold text-gray-600">
              Description
            </th>

            {products.map((product) => (
              <td
                key={product.serialNumber}
                className="px-4 py-4 align-top text-sm leading-6 text-gray-700"
              >
                {product.description ?? "No description available."}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

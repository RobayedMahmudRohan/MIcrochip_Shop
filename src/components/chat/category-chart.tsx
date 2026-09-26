type Category = {
  category: string;
  productCount: number;
};

type CategoryChartProps = {
  categories: Category[];
};

export function CategoryChart({
  categories,
}: CategoryChartProps) {
  const maxCount = Math.max(
    ...categories.map((category) => category.productCount),
    1,
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <p className="font-semibold text-slate-900">
          Products by category
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Number of products currently listed in each category.
        </p>
      </div>

      <div className="space-y-3">
        {categories.map((category) => {
          const width = `${(category.productCount / maxCount) * 100}%`;

          return (
            <div key={category.category}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-700">
                  {category.category}
                </span>

                <span className="font-medium text-slate-900">
                  {category.productCount}
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-slate-700"
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
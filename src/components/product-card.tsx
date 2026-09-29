import Link from "next/link";
import type { HomeProduct } from "@/lib/products";

export function formatPrice(price: string) {
  return `৳${Number(price).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ProductImage({
  product,
  className,
}: {
  product: HomeProduct;
  className?: string;
}) {
  if (!product.image_url) {
    return (
      <div
        className={`flex items-center justify-center bg-background text-sm text-muted ${className ?? ""}`}
      >
        No image
      </div>
    );
  }

  return (
    // Product images are arbitrary external URLs, so next/image isn't used.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.image_url}
      alt={product.name}
      loading="lazy"
      className={`object-cover ${className ?? ""}`}
    />
  );
}

export function ProductCard({ product }: { product: HomeProduct }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <ProductImage product={product} className="aspect-4/3 w-full" />

      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium tracking-wide text-accent uppercase">
          {product.category}
        </span>
        <h3 className="mt-1 font-semibold text-foreground group-hover:text-primary">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>
          <span
            className={`text-xs font-medium ${product.in_stock ? "text-success" : "text-muted"}`}
          >
            {product.in_stock ? "Available" : "Not available"}
          </span>
        </div>
      </div>
    </Link>
  );
}

import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { formatPrice } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import {
  getProductDetails,
  getProductImages,
  getProductReviews,
  getProductReviewSummary,
  getRecentUnitsSold,
} from "@/lib/products";

function Stars({ rating, size = "text-lg" }: { rating: number; size?: string }) {
  const rounded = Math.round(rating);

  return (
    <span aria-hidden className={`tracking-tight ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rounded ? "text-accent" : "text-border"}>
          ★
        </span>
      ))}
    </span>
  );
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ProductDetailsPage({
  params,
}: PageProps<"/products/[id]">) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const [product, images, reviews, summary, recentlySold] = await Promise.all([
    getProductDetails(productId),
    getProductImages(productId),
    getProductReviews(productId),
    getProductReviewSummary(productId),
    getRecentUnitsSold(productId),
  ]);

  if (!product) {
    notFound();
  }

  // Multi-line descriptions are shown as a bullet list of features.
  const descriptionLines = (product.description ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={images} productName={product.name} />

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {product.name}
          </h1>

          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div className="flex gap-1">
              <dt className="font-semibold text-foreground">Serial</dt>
              <dd className="text-muted">{product.serial_number}</dd>
            </div>
            <div className="flex gap-1">
              <dt className="font-semibold text-foreground">Category</dt>
              <dd className="text-muted">{product.category}</dd>
            </div>
          </dl>

          {descriptionLines.length > 0 && (
            <div className="mt-5 border-t border-border pt-5 text-sm text-foreground">
              {descriptionLines.length > 1 ? (
                <ul className="list-disc space-y-1 pl-5">
                  {descriptionLines.map((line, index) => (
                    <li key={index}>{line.replace(/^[-•*]\s*/, "")}</li>
                  ))}
                </ul>
              ) : (
                <p>{descriptionLines[0]}</p>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5">
            <span className="text-3xl font-semibold text-accent">
              {formatPrice(product.price)}
            </span>

            {summary.count > 0 ? (
              <a
                href="#reviews"
                className="flex items-center gap-2 text-sm text-muted hover:text-primary"
              >
                <Stars rating={summary.average} />
                <span>
                  {summary.average.toFixed(1)}/5 · {summary.count} review
                  {summary.count === 1 ? "" : "s"}
                </span>
              </a>
            ) : (
              <span className="text-sm text-muted">No reviews yet</span>
            )}
          </div>

          <p
            className={`mt-3 text-sm font-medium ${product.in_stock ? "text-success" : "text-error"}`}
          >
            {product.in_stock ? "In stock" : "Out of stock"}
          </p>

          <div className="mt-5">
            <AddToCart inStock={product.in_stock} />
          </div>

          {recentlySold > 0 && (
            <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
              🔥{" "}
              <span className="font-semibold text-accent">
                {recentlySold} sold
              </span>{" "}
              in the last 30 days
            </p>
          )}
        </div>
      </div>

      <section id="reviews" aria-labelledby="reviews-heading" className="mt-14 scroll-mt-6">
        <h2
          id="reviews-heading"
          className="text-2xl font-semibold tracking-tight text-foreground"
        >
          Reviews
        </h2>

        {reviews.length === 0 ? (
          <p className="mt-4 text-muted">
            No reviews yet for this product.
          </p>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-4xl font-semibold text-foreground">
                {summary.average.toFixed(1)}
              </span>
              <div>
                <Stars rating={summary.average} size="text-xl" />
                <p className="text-sm text-muted">
                  Based on {summary.count} review{summary.count === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-lg border border-border bg-surface p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {review.user_name}
                    </span>
                    <time className="text-sm text-muted">
                      {formatDate(review.created_at)}
                    </time>
                  </div>
                  <div className="mt-1" aria-label={`Rated ${review.rating} out of 5`}>
                    <Stars rating={review.rating} size="text-base" />
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-foreground">{review.comment}</p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

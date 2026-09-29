"use client";

import { useState } from "react";
import type { ProductImage } from "@/lib/products";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-surface text-muted">
        No image
      </div>
    );
  }

  const current = images[active];

  function step(offset: number) {
    setActive((index) => (index + offset + images.length) % images.length);
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {/* Product images may be external URLs, so next/image isn't used. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.image_url}
          alt={`${productName} – image ${active + 1} of ${images.length}`}
          className="aspect-square w-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous image"
            className="shrink-0 rounded-lg px-2 py-1 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            ‹
          </button>

          <div className="flex gap-2 overflow-x-auto p-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1}`}
                aria-current={index === active}
                className={`shrink-0 overflow-hidden rounded-lg border-2 bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${index === active ? "border-primary" : "border-border hover:border-muted"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.image_url}
                  alt=""
                  loading="lazy"
                  className="h-20 w-20 object-contain"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next image"
            className="shrink-0 rounded-lg px-2 py-1 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

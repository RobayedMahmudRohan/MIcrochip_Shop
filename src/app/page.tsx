import ChatWidget from "@/components/chat/chat-widget";
import { ProductCard } from "@/components/product-card";
import { TopSellersCarousel } from "@/components/top-sellers-carousel";
import {
  getAllProductsShuffled,
  getRandomTopSellingProducts,
  getTopSellersOfTheDay,
  type HomeProduct,
} from "@/lib/products";

// Random picks and "today" sellers must be fresh on every request.
export const dynamic = "force-dynamic";

function ProductGrid({ products }: { products: HomeProduct[] }) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function Home() {
  const [topSelling, topToday, allProducts] = await Promise.all([
    getRandomTopSellingProducts(),
    getTopSellersOfTheDay(),
    getAllProductsShuffled(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-14 px-6 py-10">
      {topSelling.length > 0 && <TopSellersCarousel products={topSelling} />}

      {topToday.length > 0 && (
        <section aria-labelledby="top-today-heading">
          <h2
            id="top-today-heading"
            className="text-2xl font-semibold tracking-tight text-foreground"
          >
            Top sellers of the day
          </h2>
          <ProductGrid products={topToday} />
        </section>
      )}

      <section aria-labelledby="all-products-heading">
        <h2
          id="all-products-heading"
          className="text-2xl font-semibold tracking-tight text-foreground"
        >
          All products
        </h2>
        {allProducts.length > 0 ? (
          <ProductGrid products={allProducts} />
        ) : (
          <p className="mt-4 text-muted">No products yet.</p>
        )}
      </section>

      <ChatWidget />
    </div>
  );
}

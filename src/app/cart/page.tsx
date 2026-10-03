import { ButtonLink } from "@/components/button-link";
import { CartView } from "@/components/cart/cart-view";

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Shopping Cart
          </h1>
          <p className="mt-2 text-muted">Review your components before checkout.</p>
        </div>
        <ButtonLink href="/" variant="secondary">
          Continue Shopping
        </ButtonLink>
      </div>

      <CartView />
    </div>
  );
}

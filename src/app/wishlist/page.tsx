import { PlaceholderPage } from "@/components/placeholder-page";
import { requireUser } from "@/lib/auth/guards";

export default async function WishlistPage() {
  await requireUser("/wishlist");

  return (
    <PlaceholderPage
      title="Wishlist"
      description="Products you've saved for later."
    />
  );
}

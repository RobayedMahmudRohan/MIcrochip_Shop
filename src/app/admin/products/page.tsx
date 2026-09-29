import { PlaceholderPage } from "@/components/placeholder-page";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminProductsPage() {
  await requireAdmin("/admin/products");

  return (
    <PlaceholderPage
      title="Admin · Products"
      description="Manage products."
    />
  );
}

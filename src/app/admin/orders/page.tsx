import { PlaceholderPage } from "@/components/placeholder-page";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminOrdersPage() {
  await requireAdmin("/admin/orders");

  return (
    <PlaceholderPage title="Admin · Orders" description="Manage orders." />
  );
}

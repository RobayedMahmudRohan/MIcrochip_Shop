import { PlaceholderPage } from "@/components/placeholder-page";
import { requireUser } from "@/lib/auth/guards";

export default async function OrdersPage() {
  await requireUser("/orders");

  return (
    <PlaceholderPage title="Orders" description="Your order history." />
  );
}

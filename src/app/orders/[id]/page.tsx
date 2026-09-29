import { PlaceholderPage } from "@/components/placeholder-page";
import { requireUser } from "@/lib/auth/guards";

export default async function OrderDetailsPage({
  params,
}: PageProps<"/orders/[id]">) {
  const { id } = await params;
  await requireUser(`/orders/${encodeURIComponent(id)}`);

  return (
    <PlaceholderPage
      title="Order Details"
      description={`Order ID: ${id}`}
    />
  );
}

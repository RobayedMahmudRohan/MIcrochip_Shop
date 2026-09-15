import { PlaceholderPage } from "@/components/placeholder-page";

export default async function OrderDetailsPage({
  params,
}: PageProps<"/orders/[id]">) {
  const { id } = await params;

  return (
    <PlaceholderPage
      title="Order Details"
      description={`Order ID: ${id}`}
    />
  );
}

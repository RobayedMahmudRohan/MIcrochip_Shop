import { PlaceholderPage } from "@/components/placeholder-page";

export default async function ProductDetailsPage({
  params,
}: PageProps<"/products/[id]">) {
  const { id } = await params;

  return (
    <PlaceholderPage title="Product Details" description={`Product ID: ${id}`} />
  );
}

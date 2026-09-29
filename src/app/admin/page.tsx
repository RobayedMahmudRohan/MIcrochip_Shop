import { PlaceholderPage } from "@/components/placeholder-page";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminDashboardPage() {
  await requireAdmin("/admin");

  return (
    <PlaceholderPage
      title="Admin Dashboard"
      description="Admin overview page."
    />
  );
}

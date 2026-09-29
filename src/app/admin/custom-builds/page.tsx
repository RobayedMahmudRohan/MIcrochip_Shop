import { PlaceholderPage } from "@/components/placeholder-page";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminCustomBuildsPage() {
  await requireAdmin("/admin/custom-builds");

  return (
    <PlaceholderPage
      title="Admin · Custom Builds"
      description="Manage custom build requests."
    />
  );
}

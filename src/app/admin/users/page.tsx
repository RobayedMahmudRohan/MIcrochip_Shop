import { PlaceholderPage } from "@/components/placeholder-page";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminUsersPage() {
  await requireAdmin("/admin/users");

  return (
    <PlaceholderPage title="Admin · Users" description="Manage users." />
  );
}

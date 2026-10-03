import { PlaceholderPage } from "@/components/placeholder-page";
import { requireUser } from "@/lib/auth/guards";

export default async function SettingsPage() {
  await requireUser("/settings");

  return (
    <PlaceholderPage
      title="Settings"
      description="Manage your account preferences."
    />
  );
}

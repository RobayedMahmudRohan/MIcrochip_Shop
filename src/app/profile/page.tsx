import { PlaceholderPage } from "@/components/placeholder-page";
import { requireUser } from "@/lib/auth/guards";

export default async function ProfilePage() {
  await requireUser("/profile");

  return (
    <PlaceholderPage
      title="Profile"
      description="Manage your account details."
    />
  );
}

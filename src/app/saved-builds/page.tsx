import { PlaceholderPage } from "@/components/placeholder-page";
import { requireUser } from "@/lib/auth/guards";

export default async function SavedBuildsPage() {
  await requireUser("/saved-builds");

  return (
    <PlaceholderPage
      title="Saved Builds"
      description="Custom builds you've saved."
    />
  );
}

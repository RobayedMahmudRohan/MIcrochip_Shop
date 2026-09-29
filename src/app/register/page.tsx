import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/auth/validation";

export const metadata: Metadata = { title: "Create account | Microchip Shop" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const next = safeRedirectPath((await searchParams).next, "");

  if (await getCurrentUser()) {
    redirect(next || "/");
  }

  return (
    <AuthCard
      title="Create an account"
      description="Save your wishlist and keep track of your orders."
    >
      <RegisterForm next={next || undefined} />
    </AuthCard>
  );
}

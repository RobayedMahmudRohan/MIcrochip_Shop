import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/auth/validation";

export const metadata: Metadata = { title: "Log in | Microchip Shop" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeRedirectPath((await searchParams).next, "");

  if (await getCurrentUser()) {
    redirect(next || "/");
  }

  return (
    <AuthCard title="Log in" description="Welcome back to Microchip Shop.">
      <LoginForm next={next || undefined} />
    </AuthCard>
  );
}

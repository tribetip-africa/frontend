"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/context/auth-context";
import { normalizeAuthRedirectPath } from "@/lib/protected-routes";
import type { SignInPayload } from "@/types/api";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const confirmEmail = searchParams.get("confirm_email") === "1";

  async function handleSubmit(values: Record<string, string>) {
    await signIn(values as unknown as SignInPayload);
    router.push(normalizeAuthRedirectPath(searchParams.get("next")));
  }

  return (
    <AuthPageShell
      mode="sign-in"
      title="Log in"
      description="Welcome back — manage your tip page and payouts."
      banner={
        confirmEmail ? (
          <p
            className="mt-4 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-brand-800"
            role="status"
          >
            Account created. Check your email and confirm your address before signing in.
          </p>
        ) : undefined
      }
    >
      <AuthForm mode="sign-in" onSubmit={handleSubmit} />
    </AuthPageShell>
  );
}

export default function SignInPage() {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <main className="flex flex-1 items-center justify-center px-4 py-12 text-brand-700">
            Loading…
          </main>
        }
      >
        <SignInContent />
      </Suspense>
    </>
  );
}

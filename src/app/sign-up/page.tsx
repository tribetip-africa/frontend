"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/context/auth-context";
import type { SignUpPayload } from "@/types/api";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();
  const defaultUsername = searchParams.get("username") ?? "";

  async function handleSubmit(values: Record<string, string>) {
    const payload = values as unknown as SignUpPayload;
    const { confirmationRequired } = await signUp(payload);
    if (confirmationRequired) {
      router.push("/sign-in?confirm_email=1");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <AuthPageShell
      mode="sign-up"
      title="Start my page"
      description="It's free and takes less than a minute."
      note={
        <p className="mt-2 text-xs text-muted">
          Platform admin accounts are provisioned separately and cannot receive tips.
        </p>
      }
    >
      <AuthForm mode="sign-up" onSubmit={handleSubmit} defaultUsername={defaultUsername} />
    </AuthPageShell>
  );
}

export default function SignUpPage() {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <main className="flex flex-1 items-center justify-center px-4 py-12 text-muted">
            Loading…
          </main>
        }
      >
        <SignUpContent />
      </Suspense>
    </>
  );
}

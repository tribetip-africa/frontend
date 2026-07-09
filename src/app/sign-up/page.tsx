"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/context/auth-context";
import { clearReferralCode, getReferralCode, normalizeReferralCode, setReferralCode } from "@/lib/referral-attribution";
import type { SignUpPayload } from "@/types/api";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();
  const defaultUsername = searchParams.get("username") ?? "";
  const referralFromUrl = searchParams.get("ref");
  const defaultReferralCode = referralFromUrl ?? getReferralCode() ?? "";

  useEffect(() => {
    if (referralFromUrl) {
      setReferralCode(referralFromUrl);
    }
  }, [referralFromUrl]);

  async function handleSubmit(values: Record<string, string>) {
    const payload = values as unknown as SignUpPayload;
    const manualReferralCode = normalizeReferralCode(values.referral_code);
    const referralCode = manualReferralCode ?? getReferralCode();
    if (referralCode) {
      payload.referral_code = referralCode;
    } else {
      delete payload.referral_code;
    }

    const { confirmationRequired } = await signUp(payload);
    clearReferralCode();

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
      <AuthForm
        mode="sign-up"
        onSubmit={handleSubmit}
        defaultUsername={defaultUsername}
        defaultReferralCode={defaultReferralCode}
      />
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

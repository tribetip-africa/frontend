"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/context/auth-context";
import { fetchEarlyAccessInvite } from "@/lib/api";
import { clearEarlyAccessToken, getEarlyAccessToken, normalizeEarlyAccessToken, setEarlyAccessToken } from "@/lib/early-access-attribution";
import { getDisplayMessage } from "@/lib/errors";
import { isSignupOpen } from "@/lib/launch-mode";
import { setReferralCode } from "@/lib/referral-attribution";
import type { SignUpPayload } from "@/types/api";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();
  const defaultUsername = searchParams.get("username") ?? "";
  const referralFromUrl = searchParams.get("ref");
  const eaFromUrl = normalizeEarlyAccessToken(searchParams.get("ea"));
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(!isSignupOpen());

  useEffect(() => {
    if (referralFromUrl) {
      setReferralCode(referralFromUrl);
    }
  }, [referralFromUrl]);

  useEffect(() => {
    if (isSignupOpen()) {
      return;
    }

    let cancelled = false;
    const token = eaFromUrl ?? getEarlyAccessToken();

    async function run() {
      if (!token) {
        setInviteError("An early access invite is required to sign up.");
        setInviteLoading(false);
        return;
      }

      try {
        const preview = await fetchEarlyAccessInvite(token);
        if (cancelled) return;
        setEarlyAccessToken(token);
        setInviteToken(token);
        setInviteEmail(preview.email);
        setInviteError(null);
      } catch (err) {
        if (!cancelled) {
          setInviteError(getDisplayMessage(err));
        }
      } finally {
        if (!cancelled) {
          setInviteLoading(false);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [eaFromUrl]);

  async function handleSubmit(values: Record<string, string>) {
    const payload = values as unknown as SignUpPayload;

    if (inviteToken) {
      payload.early_access_token = inviteToken;
      if (inviteEmail) {
        payload.email = inviteEmail;
      }
    }

    const { confirmationRequired } = await signUp(payload);
    clearEarlyAccessToken();
    void fetch("/api/early-access/cookie", { method: "DELETE" });

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
      description={
        inviteEmail
          ? "Your early access invite is ready. Choose a username and password to continue."
          : "It's free and takes less than a minute."
      }
      note={
        <p className="mt-2 text-xs text-muted">
          Platform admin accounts are provisioned separately and cannot receive tips.
        </p>
      }
    >
      {inviteLoading ? (
        <p className="text-sm text-muted">Checking invite…</p>
      ) : inviteError ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {inviteError}
        </p>
      ) : (
        <AuthForm
          mode="sign-up"
          onSubmit={handleSubmit}
          defaultUsername={defaultUsername}
          lockedEmail={inviteEmail ?? undefined}
        />
      )}
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

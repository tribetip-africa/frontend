"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { ProfileSettings } from "@/components/profile-settings";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { API_BASE, checkApiHealth, fetchMyProfile } from "@/lib/api";
import { accountStatusBanner } from "@/lib/account-access";
import { getDisplayMessage } from "@/lib/errors";
import { getCreatorPageDisplayUrl } from "@/lib/platform";
import type { CreatorProfile } from "@/types/api";

export default function DashboardPage() {
  const router = useRouter();
  const { tribe, token, isLoading, signOut } = useAuth();
  const signingOut = useRef(false);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !tribe && !signingOut.current) {
      router.replace("/sign-in");
    }
  }, [isLoading, tribe, router]);

  useEffect(() => {
    if (!token) return;

    fetchMyProfile(token)
      .then(setProfile)
      .catch((error) => setProfileError(getDisplayMessage(error)));
  }, [token]);

  const handleSignOut = () => {
    signingOut.current = true;
    signOut().then(() => router.replace("/"));
  };

  useEffect(() => {
    checkApiHealth().then((ok) => {
      if (!ok) {
        console.warn("API health check failed — is the Rails server running?", API_BASE);
      }
    });
  }, []);

  if (isLoading || !tribe || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-700">
        Loading…
      </div>
    );
  }

  const statusBanner = accountStatusBanner(tribe);
  const bannerStyles =
    statusBanner?.tone === "danger"
      ? "border-red-200 bg-red-50 text-red-800"
      : statusBanner?.tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-brand-200 bg-accent-soft text-brand-800";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6">
        {statusBanner && (
          <p
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${bannerStyles}`}
            role="status"
          >
            {statusBanner.message}
          </p>
        )}
        <h1 className="text-2xl font-bold text-brand-900">Your dashboard</h1>
        <p className="mt-1 text-brand-700">
          Signed in as <span className="font-medium">@{tribe.username}</span>
        </p>

        <div className="mt-8 space-y-4">
          {profileError && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {profileError}
            </p>
          )}

          {profile && (
            <ProfileSettings
              token={token}
              initialProfile={profile}
              onProfileChange={setProfile}
            />
          )}

          <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-brand-900">Your public page</h2>
            <p className="mt-2 text-sm text-brand-700">
              Supporters will visit:
            </p>
            <p className="mt-2 rounded-xl bg-brand-50 px-4 py-3 font-mono text-sm text-brand-800">
              {getCreatorPageDisplayUrl(tribe.username)}
            </p>
            <p className="mt-3 text-xs text-brand-600">
              {profile?.is_profile_public
                ? "Your page is published and visible to supporters."
                : "Publish your profile to make this page public."}
            </p>
          </section>

          <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-brand-900">Account</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-brand-50 pb-2">
                <dt className="text-brand-600">Email</dt>
                <dd className="font-medium text-brand-900">{tribe.email}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-brand-50 pb-2">
                <dt className="text-brand-600">Username</dt>
                <dd className="font-medium text-brand-900">@{tribe.username}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-brand-50 pb-2">
                <dt className="text-brand-600">Status</dt>
                <dd className="font-medium capitalize text-brand-900">{tribe.account_status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-brand-600">Creator ID</dt>
                <dd className="truncate font-mono text-xs text-brand-800">{tribe.id}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-dashed border-brand-200 bg-accent-soft/40 p-6">
            <h2 className="font-semibold text-brand-900">Coming soon</h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-brand-700">
              <li>One-tap tips via Paystack (card & mobile money)</li>
              <li>Custom tip amounts and thank-you messages</li>
              <li>Balance & payouts to local bank accounts</li>
            </ul>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/">
            <Button variant="secondary" type="button">
              Back to home
            </Button>
          </Link>
          <Button variant="ghost" type="button" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </main>
    </>
  );
}

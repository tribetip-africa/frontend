"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { API_BASE, checkApiHealth } from "@/lib/api";
import { getCreatorPageDisplayUrl } from "@/lib/platform";

export default function DashboardPage() {
  const router = useRouter();
  const { tribe, isLoading, signOut } = useAuth();
  const signingOut = useRef(false);

  useEffect(() => {
    if (!isLoading && !tribe && !signingOut.current) {
      router.replace("/sign-in");
    }
  }, [isLoading, tribe, router]);

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

  if (isLoading || !tribe) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-700">
        Loading…
      </div>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-brand-900">Your dashboard</h1>
        <p className="mt-1 text-brand-700">
          Signed in as <span className="font-medium">@{tribe.username}</span>
        </p>

        <div className="mt-8 space-y-4">
          <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-brand-900">Your public page</h2>
            <p className="mt-2 text-sm text-brand-700">
              When tips go live, supporters will visit:
            </p>
            <p className="mt-2 rounded-xl bg-brand-50 px-4 py-3 font-mono text-sm text-brand-800">
              {getCreatorPageDisplayUrl(tribe.username)}
            </p>
            <p className="mt-3 text-xs text-brand-600">
              Tip checkout and public profiles are coming in the next release.
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

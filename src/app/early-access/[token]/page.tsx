"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { setEarlyAccessToken } from "@/lib/early-access-attribution";
import { getDisplayMessage } from "@/lib/errors";
import { fetchEarlyAccessInvite } from "@/lib/api";
import { isValidEarlyAccessToken } from "@/lib/launch-mode";

export default function EarlyAccessPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = typeof params.token === "string" ? params.token : "";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!isValidEarlyAccessToken(token)) {
        setError("This invite link is invalid.");
        return;
      }

      try {
        await fetchEarlyAccessInvite(token);
        if (cancelled) return;

        setEarlyAccessToken(token);
        await fetch("/api/early-access/cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (cancelled) return;
        router.replace(`/sign-up?ea=${encodeURIComponent(token)}`);
      } catch (err) {
        if (!cancelled) {
          setError(getDisplayMessage(err));
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
        {error ? (
          <div className="rounded-2xl border border-coral/30 bg-coral/10 px-5 py-4 text-sm text-coral" role="alert">
            <p className="font-semibold">Invite unavailable</p>
            <p className="mt-1">{error}</p>
            <p className="mt-3 text-brand-700">
              If you were approved for early access, ask us for a fresh invite link.
            </p>
          </div>
        ) : (
          <p className="text-center text-sm text-muted">Checking your invite…</p>
        )}
      </main>
    </>
  );
}

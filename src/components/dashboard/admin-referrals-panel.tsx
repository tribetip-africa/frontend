"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchAdminReferrals, rejectAdminReferral } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import type { AdminReferralSummary, AdminReferralsResponse } from "@/types/api";

type AdminReferralsPanelProps = {
  token: string | null;
};

export function AdminReferralsPanel({ token }: AdminReferralsPanelProps) {
  const [payload, setPayload] = useState<AdminReferralsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  async function load() {
    setError(null);
    const data = await fetchAdminReferrals(token, { limit: 10 });
    setPayload(data);
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const data = await fetchAdminReferrals(token, { limit: 10 });
        if (!cancelled) {
          setPayload(data);
        }
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
  }, [token]);

  async function handleReject(referral: AdminReferralSummary) {
    const reason = window.prompt("Reason for rejecting this referral?");
    if (!reason?.trim()) {
      return;
    }

    setRejectingId(referral.id);
    setError(null);

    try {
      await rejectAdminReferral(token, referral.id, reason.trim());
      await load();
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setRejectingId(null);
    }
  }

  if (error && !payload) {
    return (
      <section className="rounded-2xl border border-coral/30 bg-coral/10 p-5 text-sm text-coral">
        {error}
      </section>
    );
  }

  if (!payload) {
    return (
      <section className="rounded-2xl border border-brand-100 bg-white p-5 text-sm text-brand-700 shadow-sm">
        Loading referral funnel…
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="font-semibold text-brand-900">Referral funnel</h2>
        <p className="mt-1 text-sm text-brand-700">
          {payload.overview.total} total referrals · {payload.overview.pending} pending ·{" "}
          {payload.overview.rewarded} rewarded · {payload.overview.rejected} rejected
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
          {error}
        </p>
      )}

      {payload.referrals.length === 0 ? (
        <p className="mt-4 text-sm text-brand-600">No referrals recorded yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-brand-100">
          {payload.referrals.map((referral) => (
            <li key={referral.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-brand-900">
                  @{referral.referrer_username} → @{referral.referred_username}
                </p>
                <p className="text-xs text-brand-600">
                  {referral.status}
                  {referral.referrer_bonus_cents != null && referral.referrer_bonus_currency
                    ? ` · bonus ${formatMoney(referral.referrer_bonus_cents, referral.referrer_bonus_currency)}`
                    : ""}
                  {typeof referral.metadata.rejected_reason === "string"
                    ? ` · ${referral.metadata.rejected_reason}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-500">
                  {new Date(referral.signed_up_at).toLocaleDateString()}
                </span>
                {(referral.status === "pending" || referral.status === "qualified") && (
                  <Button
                    variant="ghost"
                    type="button"
                    disabled={rejectingId === referral.id}
                    onClick={() => void handleReject(referral)}
                  >
                    {rejectingId === referral.id ? "Rejecting…" : "Reject"}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

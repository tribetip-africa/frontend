"use client";

import { useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/dashboard-context";
import { fetchMyReferrals, rotateReferralInvite, updateMyReferrals } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import type { ReferralsSummary } from "@/types/api";

function statusLabel(status: ReferralsSummary["entries"][number]["status"]): string {
  switch (status) {
    case "qualified":
      return "Qualified";
    case "rewarded":
      return "Rewarded";
    case "rejected":
      return "Rejected";
    default:
      return "Pending";
  }
}

function statusTone(status: ReferralsSummary["entries"][number]["status"]): string {
  switch (status) {
    case "qualified":
    case "rewarded":
      return "border-green-200 bg-green-50 text-green-800";
    case "rejected":
      return "border-coral/30 bg-coral/10 text-coral";
    default:
      return "border-brand-100 bg-brand-50 text-brand-700";
  }
}

export function CreatorReferralsPage() {
  const { token } = useDashboard();
  const [payload, setPayload] = useState<ReferralsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchMyReferrals(token);
        if (!cancelled) {
          setPayload(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getDisplayMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function copyReferralLink() {
    if (!payload?.link.url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(payload.link.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function copyReferralCode() {
    if (!payload?.link.code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(payload.link.code);
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      setCodeCopied(false);
    }
  }

  async function handleToggleReferrals() {
    if (!payload) {
      return;
    }

    const nextEnabled = !payload.referrals_enabled;
    setToggling(true);
    setError(null);

    try {
      const data = await updateMyReferrals(token, nextEnabled);
      setPayload(data);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setToggling(false);
    }
  }

  async function handleRotateInvite() {
    setRotating(true);
    setError(null);

    try {
      const { invite } = await rotateReferralInvite(token);
      setPayload((current) =>
        current
          ? {
              ...current,
              link: invite,
            }
          : current,
      );
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setRotating(false);
    }
  }

  function formatExpiry(expiresAt: string | null): string {
    if (!expiresAt) {
      return "Not active";
    }

    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <>
      <DashboardPageHeader
        title="Invite creators"
        description="Share your link or code so other creators can join TribeTip. Friends can use the link or paste the code when they sign up."
      />

      {loading && (
        <p className="text-sm text-brand-700">Loading your referral link…</p>
      )}

      {error && (
        <p className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral" role="alert">
          {error}
        </p>
      )}

      {payload && (
        <div className="space-y-5">
          {!payload.program_enabled && (
            <p className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              The referral program is temporarily unavailable on TribeTip. Your past referrals are still shown below.
            </p>
          )}

          <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-brand-900">Referral invites</h2>
                <p className="mt-1 text-sm text-brand-700">
                  {payload.referrals_enabled
                    ? payload.can_refer
                      ? "Your invite link and code are active. Turn this off anytime to stop new sign-ups from counting toward you."
                      : "Referrals are on, but finish payout setup before new invites can count."
                    : "Referrals are turned off. Existing stats stay here, but your link and code no longer work for new sign-ups."}
                </p>
              </div>
              <Button
                type="button"
                variant={payload.referrals_enabled ? "secondary" : "primary"}
                disabled={toggling || loading || !payload.program_enabled}
                onClick={() => void handleToggleReferrals()}
              >
                {toggling
                  ? "Saving…"
                  : payload.referrals_enabled
                    ? "Turn referrals off"
                    : "Turn referrals on"}
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-brand-900">Your referral invite</h2>
                <p className="mt-1 text-sm text-brand-700">
                  {payload.referrals_enabled
                    ? payload.can_refer
                      ? "Share your link or code with creators you know. The code expires with the link and can be rotated anytime."
                      : "Finish onboarding and payouts setup before your invite can count toward referrals."
                    : "Turn referrals on to generate a fresh invite link and code."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => void handleRotateInvite()}
                  disabled={rotating || !payload.referrals_enabled || !payload.can_refer}
                >
                  {rotating ? "Generating…" : "New code"}
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => void copyReferralCode()}
                  disabled={!payload.referrals_enabled || !payload.can_refer || !payload.link.code}
                >
                  {codeCopied ? "Code copied" : "Copy code"}
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => void copyReferralLink()}
                  disabled={!payload.referrals_enabled || !payload.can_refer || !payload.link.url}
                >
                  {copied ? "Link copied" : "Copy link"}
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="referral_link" className="text-xs font-medium uppercase tracking-wide text-brand-600">
                  Sign-up URL
                </label>
                <input
                  id="referral_link"
                  readOnly
                  value={payload.link.url ?? "Turn referrals on to generate a link."}
                  className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 font-mono text-sm text-brand-900"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="referral_code" className="text-xs font-medium uppercase tracking-wide text-brand-600">
                  Referral code
                </label>
                <input
                  id="referral_code"
                  readOnly
                  value={payload.link.code ?? "No active code"}
                  className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 font-mono text-sm text-brand-900"
                />
              </div>
              <p className="text-xs text-brand-600">
                {payload.link.expires_at ? (
                  <>
                    Expires {formatExpiry(payload.link.expires_at)}. Friends can also enter{" "}
                    <span className="font-semibold">@{payload.link.username_code}</span> manually on sign-up when referrals are on.
                  </>
                ) : (
                  <>
                    Friends can enter <span className="font-semibold">@{payload.link.username_code}</span> on sign-up only while your referrals are turned on.
                  </>
                )}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-semibold text-brand-900">How referrals qualify</h2>
            <p className="mt-1 text-sm text-brand-700">
              A referred creator qualifies after they finish payout setup and receive their first paid tip of at least{" "}
              {formatMoney(payload.qualification.min_tip_cents, payload.qualification.currency)}.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-brand-700">
              <li>
                You earn {formatMoney(payload.qualification.referrer_bonus_cents, payload.qualification.currency)} when they qualify.
              </li>
              <li>
                They receive {formatMoney(payload.qualification.referred_fee_credit_cents, payload.qualification.currency)} in welcome fee credits.
              </li>
              {payload.fee_credit_cents_remaining > 0 && (
                <li>
                  Your remaining welcome fee credits:{" "}
                  {formatMoney(payload.fee_credit_cents_remaining, payload.qualification.currency)}.
                </li>
              )}
            </ul>
          </section>

          <section className="grid gap-3 sm:grid-cols-4">
            {[
              { label: "Signed up", value: payload.stats.total },
              { label: "Pending", value: payload.stats.pending },
              { label: "Qualified", value: payload.stats.qualified },
              { label: "Rewarded", value: payload.stats.rewarded },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-brand-100 bg-white px-4 py-4 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-brand-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-brand-900">{item.value}</p>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-semibold text-brand-900">Referred creators</h2>
            <p className="mt-1 text-sm text-brand-700">
              Pending creators have signed up. Qualified creators finished onboarding and received a first tip. Rewarded means your bonus was sent.
            </p>

            {payload.entries.length === 0 ? (
              <p className="mt-4 text-sm text-brand-600">
                No referred creators yet. Share your link to get started.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-brand-100">
                {payload.entries.map((entry) => (
                  <li key={`${entry.username}-${entry.signed_up_at}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium text-brand-900">@{entry.username}</p>
                      <p className="text-xs text-brand-600">
                        Signed up {new Date(entry.signed_up_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusTone(entry.status)}`}>
                      {statusLabel(entry.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}

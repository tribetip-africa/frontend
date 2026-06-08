"use client";

import { formatMoney } from "@/lib/money";
import type { PaystackOnboardingPayload, PaystackPayoutStatus } from "@/types/api";
import { Button } from "@/components/ui/button";
import { PaystackVerificationChecks } from "@/components/paystack-verification-checks";

type PaystackPayoutStatusPanelProps = {
  payload: PaystackOnboardingPayload | null;
  error: string | null;
  loading: boolean;
  onRefresh: () => void;
};

function resolvePayout(payload: PaystackOnboardingPayload): PaystackPayoutStatus | null {
  return payload.payout ?? payload.onboarding.payout ?? null;
}

export function PaystackPayoutStatusPanel({
  payload,
  error,
  loading,
  onRefresh,
}: PaystackPayoutStatusPanelProps) {
  if (loading && !payload) {
    return <p className="text-sm text-brand-700">Checking Paystack payout status…</p>;
  }

  if (error && !payload) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
        <Button type="button" variant="secondary" onClick={onRefresh}>
          Retry
        </Button>
      </div>
    );
  }

  if (!payload) return null;

  const { onboarding, market } = payload;
  const payout = resolvePayout(payload);
  const verified =
    payout?.subaccount_verified === true || onboarding.subaccount_verified === true;
  const currency = payout?.currency ?? market.currency;

  return (
    <div className="space-y-3">
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-brand-50 px-3 py-2">
          <dt className="text-brand-600">Paystack customer</dt>
          <dd className="font-medium text-brand-900">
            {onboarding.customer_ready ? "Linked" : "Setting up…"}
          </dd>
        </div>
        <div className="rounded-xl bg-brand-50 px-3 py-2">
          <dt className="text-brand-600">Payout account</dt>
          <dd className="font-medium text-brand-900">
            {!market.subaccount_supported
              ? "Not available in your market"
              : onboarding.subaccount_ready
                ? verified
                  ? "Verified"
                  : "Pending verification"
                : "Not linked"}
          </dd>
        </div>
      </dl>

      {payout && market.subaccount_supported && onboarding.subaccount_ready && (
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {payout.settlement_bank && (
            <div className="rounded-xl border border-brand-100 px-3 py-2">
              <dt className="text-brand-600">Settlement method</dt>
              <dd className="font-medium text-brand-900">{payout.settlement_bank}</dd>
            </div>
          )}
          {payout.account_number && (
            <div className="rounded-xl border border-brand-100 px-3 py-2">
              <dt className="text-brand-600">Account number</dt>
              <dd className="font-medium text-brand-900">{payout.account_number}</dd>
            </div>
          )}
          {typeof payout.pending_settlement_cents === "number" &&
            payout.pending_settlement_cents > 0 && (
              <div className="rounded-xl border border-brand-100 px-3 py-2">
                <dt className="text-brand-600">Pending settlement</dt>
                <dd className="font-medium text-brand-900">
                  {formatMoney(payout.pending_settlement_cents, currency)}
                </dd>
              </div>
            )}
          {typeof payout.total_volume_cents === "number" && payout.total_volume_cents > 0 && (
            <div className="rounded-xl border border-brand-100 px-3 py-2">
              <dt className="text-brand-600">Tip volume</dt>
              <dd className="font-medium text-brand-900">
                {formatMoney(payout.total_volume_cents, currency)}
                {typeof payout.total_transactions === "number" && payout.total_transactions > 0
                  ? ` · ${payout.total_transactions} payments`
                  : ""}
              </dd>
            </div>
          )}
        </dl>
      )}

      {!verified && payout?.publish_blocker && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
          {payout.publish_blocker}
        </p>
      )}

      {onboarding.verification && onboarding.verification.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            Verification checks
          </p>
          <PaystackVerificationChecks checks={onboarding.verification} />
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        className="px-0 text-brand-600 hover:bg-transparent"
        disabled={loading}
        onClick={onRefresh}
      >
        {loading ? "Refreshing…" : "Refresh payout status"}
      </Button>
    </div>
  );
}

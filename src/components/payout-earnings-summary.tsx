"use client";

import { formatMoney } from "@/lib/money";
import type { CreatorMetrics, PaystackOnboardingPayload, PaystackPayoutStatus, WithdrawalStatus } from "@/types/api";

type PayoutEarningsSummaryProps = {
  payload: PaystackOnboardingPayload | null;
  profileMetrics?: CreatorMetrics;
  withdrawalStatus?: WithdrawalStatus;
};

function resolvePayout(payload: PaystackOnboardingPayload | null): PaystackPayoutStatus | null {
  if (!payload) return null;
  return payload.payout ?? payload.onboarding.payout ?? null;
}

export function PayoutEarningsSummary({ payload, profileMetrics, withdrawalStatus }: PayoutEarningsSummaryProps) {
  const payout = resolvePayout(payload);
  const earnings = payload?.earnings ?? profileMetrics;
  const currency = payout?.currency ?? earnings?.currency ?? payload?.market.currency ?? "KES";
  const effectiveMode =
    withdrawalStatus?.effective_payout_mode ??
    withdrawalStatus?.payout_mode ??
    (payout?.settlement_schedule === "MANUAL" ? "manual" : "auto");
  const manualMode =
    effectiveMode === "manual" ||
    effectiveMode === "both" ||
    payout?.settlement_schedule === "MANUAL";

  if (!earnings && !payout) return null;

  const totalEarned = earnings?.total_earned_cents ?? 0;
  const pendingTips = earnings?.pending_tips_cents ?? 0;
  const availableToSettle =
    withdrawalStatus?.available_to_withdraw_cents ??
    payout?.available_to_settle_cents ??
    payout?.pending_settlement_cents ??
    0;
  const totalSettled = payload?.settlements_summary?.total_settled_cents ?? 0;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-brand-900">Earnings overview</h2>
        <p className="mt-1 text-sm text-brand-700">
          {manualMode
            ? "Tips are split through your Paystack subaccount. Withdraw available earnings to your linked payout account when you are ready."
            : "Tips are split through your Paystack subaccount. Paystack automatically settles eligible funds to your linked payout account."}
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3">
          <dt className="text-sm text-brand-600">Total earned</dt>
          <dd className="mt-1 text-xl font-semibold text-brand-900">
            {formatMoney(totalEarned, currency)}
          </dd>
          <p className="mt-1 text-xs text-brand-600">Paid tips recorded by TribeTip</p>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white px-4 py-3">
          <dt className="text-sm text-brand-600">Pending tips</dt>
          <dd className="mt-1 text-xl font-semibold text-brand-900">
            {formatMoney(pendingTips, currency)}
          </dd>
          <p className="mt-1 text-xs text-brand-600">Checkout still processing</p>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white px-4 py-3">
          <dt className="text-sm text-brand-600">
            {manualMode ? "Available to withdraw" : "Awaiting settlement"}
          </dt>
          <dd className="mt-1 text-xl font-semibold text-brand-900">
            {formatMoney(availableToSettle, currency)}
          </dd>
          <p className="mt-1 text-xs text-brand-600">
            {manualMode ? "Ready to send to your payout account" : "Queued with Paystack for payout"}
          </p>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white px-4 py-3">
          <dt className="text-sm text-brand-600">Total settled</dt>
          <dd className="mt-1 text-xl font-semibold text-brand-900">
            {formatMoney(totalSettled, currency)}
          </dd>
          <p className="mt-1 text-xs text-brand-600">Paid out to your linked account</p>
        </div>
      </dl>

      {payout?.settlement_schedule_label && (
        <p className="rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-brand-800">
          <span className="font-medium text-brand-900">Settlement schedule:</span>{" "}
          {payout.settlement_schedule_label}
        </p>
      )}
    </section>
  );
}

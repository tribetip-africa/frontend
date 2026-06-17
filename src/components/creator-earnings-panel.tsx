import Link from "next/link";
import { buildEarningsSnapshot } from "@/lib/creator-onboarding-progress";
import { formatMoney } from "@/lib/money";
import { MetricsGrid, formatOptionalMoney } from "@/components/metrics-grid";
import { Button } from "@/components/ui/button";
import type {
  CreatorMetrics,
  PaystackOnboardingPayload,
  PaystackPayoutStatus,
  WithdrawalStatus,
} from "@/types/api";

type CreatorEarningsPanelProps = {
  variant: "overview" | "payouts";
  metrics?: CreatorMetrics | null;
  availableToWithdrawCents?: number;
  currencyFallback?: string;
  payload?: PaystackOnboardingPayload | null;
  withdrawalStatus?: WithdrawalStatus;
};

function resolvePayout(payload: PaystackOnboardingPayload | null | undefined): PaystackPayoutStatus | null {
  if (!payload) return null;
  return payload.payout ?? payload.onboarding.payout ?? null;
}

export function CreatorEarningsPanel({
  variant,
  metrics,
  availableToWithdrawCents,
  currencyFallback = "KES",
  payload = null,
  withdrawalStatus,
}: CreatorEarningsPanelProps) {
  if (variant === "overview") {
    const snapshot = buildEarningsSnapshot(metrics, availableToWithdrawCents, currencyFallback);
    const currency = snapshot.currency;

    return (
      <section className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-brand-900">Earnings</h2>
            <p className="mt-1 text-sm text-brand-700">
              Key balances and tip activity at a glance.
            </p>
          </div>
          <Link href="/dashboard/payouts">
            <Button variant="ghost" type="button">
              Open payouts
            </Button>
          </Link>
        </div>

        <MetricsGrid
          columns={4}
          metrics={[
            {
              label: "Total earned",
              value: formatOptionalMoney(snapshot.totalEarnedCents, currency),
              hint: metrics ? `${metrics.paid_tips_count} paid tips` : "Complete payout setup to unlock",
            },
            {
              label: "Last 30 days",
              value: formatOptionalMoney(snapshot.tipsLast30DaysCents, currency),
              hint: metrics
                ? `${metrics.tips_last_30_days_count} paid tips`
                : "Recent supporter activity",
            },
            {
              label: "Available to withdraw",
              value: formatOptionalMoney(snapshot.availableToWithdrawCents, currency),
              hint:
                snapshot.availableToWithdrawCents > 0
                  ? "Ready for payout or withdrawal"
                  : "Awaiting settlement",
            },
            {
              label: "Pending tips",
              value: String(snapshot.pendingTipsCount),
              hint:
                snapshot.pendingTipsCount > 0
                  ? formatOptionalMoney(snapshot.pendingTipsCents, currency)
                  : "Awaiting payment confirmation",
            },
          ]}
        />

        {metrics && metrics.failed_tips_count > 0 && (
          <p className="text-sm text-brand-700">
            {metrics.failed_tips_count} failed checkout
            {metrics.failed_tips_count === 1 ? "" : "s"} —{" "}
            <Link href="/dashboard/tips" className="font-medium text-brand-600 hover:text-brand-800">
              review on tips page
            </Link>
          </p>
        )}
      </section>
    );
  }

  const payout = resolvePayout(payload);
  const earnings = payload?.earnings ?? metrics;
  const currency = payout?.currency ?? earnings?.currency ?? payload?.market.currency ?? currencyFallback;
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
            ? "Tips are split through your Paystack subaccount. Withdraw available earnings when you are ready."
            : "Tips are split through your Paystack subaccount. Paystack settles eligible funds automatically."}
        </p>
      </div>

      <MetricsGrid
        columns={4}
        metrics={[
          {
            label: "Total earned",
            value: formatMoney(totalEarned, currency),
            hint: "Paid tips recorded by TribeTip",
          },
          {
            label: "Pending tips",
            value: formatMoney(pendingTips, currency),
            hint: "Checkout still processing",
          },
          {
            label: manualMode ? "Available to withdraw" : "Awaiting settlement",
            value: formatMoney(availableToSettle, currency),
            hint: manualMode ? "Ready for your payout account" : "Queued with Paystack",
          },
          {
            label: "Total settled",
            value: formatMoney(totalSettled, currency),
            hint: "Paid out to your linked account",
          },
        ]}
      />

      {payout?.settlement_schedule_label && (
        <p className="rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-brand-800">
          <span className="font-medium text-brand-900">Settlement schedule:</span>{" "}
          {payout.settlement_schedule_label}
        </p>
      )}
    </section>
  );
}

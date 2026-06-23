import type { CreatorMetrics } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { formatOptionalMoney, type MetricItem } from "@/components/metrics-grid";
import { buildEarningsSnapshot } from "@/lib/creator-onboarding-progress";

export function formatCheckoutSuccessRate(metrics: CreatorMetrics): {
  value: string;
  hint: string;
} {
  const completed = metrics.paid_tips_count + metrics.failed_tips_count;
  if (completed === 0) {
    return { value: "—", hint: "No completed checkouts yet" };
  }

  const rate = Math.round((metrics.paid_tips_count / completed) * 100);
  return {
    value: `${rate}%`,
    hint: `${metrics.paid_tips_count} of ${completed} checkouts paid`,
  };
}

export function formatAverageTip(
  metrics: CreatorMetrics | null | undefined,
  currency: string,
): { value: string; hint: string } {
  if (!metrics || metrics.paid_tips_count === 0) {
    return { value: "—", hint: "No paid tips yet" };
  }

  const averageCents = Math.round(metrics.total_earned_cents / metrics.paid_tips_count);
  return {
    value: formatMoney(averageCents, currency),
    hint: `Across ${metrics.paid_tips_count} paid tip${metrics.paid_tips_count === 1 ? "" : "s"}`,
  };
}

type BuildCreatorOverviewMetricsInput = {
  metrics?: CreatorMetrics | null;
  availableToWithdrawCents?: number;
  totalSettledCents?: number;
  currencyFallback?: string;
};

export function buildCreatorOverviewMetrics({
  metrics,
  availableToWithdrawCents,
  totalSettledCents,
  currencyFallback = "KES",
}: BuildCreatorOverviewMetricsInput): MetricItem[] {
  const snapshot = buildEarningsSnapshot(metrics, availableToWithdrawCents, currencyFallback);
  const currency = snapshot.currency;
  const checkoutSuccess = metrics ? formatCheckoutSuccessRate(metrics) : null;
  const averageTip = formatAverageTip(metrics, currency);

  return [
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
      label: "Total settled",
      value: formatOptionalMoney(totalSettledCents, currency),
      hint: "Paid out to your linked account",
    },
    {
      label: "Average tip",
      value: averageTip.value,
      hint: averageTip.hint,
    },
    {
      label: "Checkout success",
      value: checkoutSuccess?.value ?? "—",
      hint: checkoutSuccess?.hint ?? "Paid vs failed checkout attempts",
    },
    {
      label: "Pending tips",
      value: String(snapshot.pendingTipsCount),
      hint:
        snapshot.pendingTipsCount > 0
          ? formatOptionalMoney(snapshot.pendingTipsCents, currency)
          : "Awaiting payment confirmation",
    },
  ];
}

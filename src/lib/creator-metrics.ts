import type { CreatorMetrics } from "@/types/api";
import {
  formatOptionalDate,
  formatOptionalMoney,
  type MetricItem,
} from "@/components/metrics-grid";

export function buildCreatorMetrics(
  metrics: CreatorMetrics,
  isProfilePublic: boolean,
): MetricItem[] {
  const currency = metrics.currency;

  return [
    {
      label: "Total earned",
      value: formatOptionalMoney(metrics.total_earned_cents, currency),
      hint: `${metrics.paid_tips_count} paid tip${metrics.paid_tips_count === 1 ? "" : "s"}`,
    },
    {
      label: "Last 30 days",
      value: formatOptionalMoney(metrics.tips_last_30_days_cents, currency),
      hint: `${metrics.tips_last_30_days_count} paid tip${metrics.tips_last_30_days_count === 1 ? "" : "s"}`,
    },
    {
      label: "Pending tips",
      value: String(metrics.pending_tips_count),
      hint:
        metrics.pending_tips_count > 0
          ? formatOptionalMoney(metrics.pending_tips_cents, currency)
          : "Awaiting payment confirmation",
    },
    {
      label: "Pending settlement",
      value:
        typeof metrics.pending_settlement_cents === "number" &&
        metrics.pending_settlement_cents > 0
          ? formatOptionalMoney(metrics.pending_settlement_cents, currency)
          : "—",
      hint: metrics.subaccount_verified ? "Paystack payout queue" : "Verify payout account first",
    },
    {
      label: "Public page",
      value: isProfilePublic ? "Live" : "Draft",
      hint: isProfilePublic ? "Visible to supporters" : "Publish to start receiving tips",
    },
    {
      label: "Last paid tip",
      value: formatOptionalDate(metrics.last_paid_at),
      hint:
        metrics.failed_tips_count > 0
          ? `${metrics.failed_tips_count} failed checkout${metrics.failed_tips_count === 1 ? "" : "s"}`
          : "Most recent successful payment",
    },
  ];
}

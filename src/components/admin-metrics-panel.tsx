import type { AdminOverview } from "@/types/api";
import {
  MetricsGrid,
  formatVolumeByCurrency,
  type MetricItem,
} from "@/components/metrics-grid";

export function buildAdminMetrics(overview: AdminOverview): MetricItem[] {
  return [
    {
      label: "Total accounts",
      value: String(overview.total_tribes),
      hint: `${overview.creators} creators · ${overview.admins} admins`,
    },
    {
      label: "Active creators",
      value: String(overview.active_tribes),
      hint: `${overview.pending_tribes} pending · ${overview.suspended_tribes} suspended`,
    },
    {
      label: "Published pages",
      value: String(overview.published_profiles),
      hint: `${overview.onboarding_complete} with payout setup complete`,
    },
    {
      label: "Paid tips",
      value: String(overview.paid_tips),
      hint: `${overview.pending_tips} pending · ${overview.failed_tips} failed`,
    },
    {
      label: "Paid volume",
      value: formatVolumeByCurrency(overview.paid_volume_cents),
      hint: "Successful tips across all markets",
    },
    {
      label: "Last 30 days",
      value: formatVolumeByCurrency(overview.volume_last_30_days_cents),
      hint: `${overview.tips_last_30_days} paid tips`,
    },
    {
      label: "Pending volume",
      value: formatVolumeByCurrency(overview.pending_volume_cents),
      hint: "Tips awaiting confirmation",
    },
    {
      label: "Payout accounts",
      value: String(overview.payout_linked),
      hint: `${overview.payout_customers} Paystack customers linked`,
    },
    {
      label: "Total tips",
      value: String(overview.total_tips),
      hint: "All checkout attempts tracked",
    },
  ];
}

type AdminMetricsPanelProps = {
  overview: AdminOverview;
  embedded?: boolean;
};

export function AdminMetricsPanel({ overview, embedded = false }: AdminMetricsPanelProps) {
  const grid = <MetricsGrid metrics={buildAdminMetrics(overview)} columns={3} />;

  if (embedded) return grid;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-semibold text-brand-900">Platform metrics</h2>
        <p className="mt-1 text-sm text-brand-700">
          Accounts, tips, and payout health across TribeTip.
        </p>
      </div>
      {grid}
    </section>
  );
}

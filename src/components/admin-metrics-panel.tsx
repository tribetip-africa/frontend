import type { AdminOverview, AdminReconciliationOverview } from "@/types/api";
import {
  MetricsGrid,
  formatOptionalDate,
  formatVolumeByCurrency,
  type MetricItem,
} from "@/components/metrics-grid";

const DEFAULT_RECONCILIATION: AdminReconciliationOverview = {
  never_run: true,
};

export function normalizeAdminOverview(
  overview: AdminOverview | (Omit<AdminOverview, "reconciliation" | "unresolved_payment_alerts" | "failed_webhooks"> & {
    reconciliation?: AdminReconciliationOverview;
    unresolved_payment_alerts?: number;
    failed_webhooks?: number;
  }),
): AdminOverview {
  return {
    ...overview,
    unresolved_payment_alerts: overview.unresolved_payment_alerts ?? 0,
    failed_webhooks: overview.failed_webhooks ?? 0,
    reconciliation: overview.reconciliation ?? DEFAULT_RECONCILIATION,
  };
}

function reconciliationMetric(reconciliation: AdminReconciliationOverview): MetricItem {
  if (reconciliation.never_run) {
    return {
      label: "Reconciliation",
      value: "—",
      hint: "No platform audit run yet",
    };
  }

  const findings = reconciliation.findings_count ?? 0;
  const critical = reconciliation.critical_count ?? 0;
  const warnings = reconciliation.warning_count ?? 0;
  const checkedAt = formatOptionalDate(reconciliation.checked_at);

  return {
    label: "Reconciliation",
    value: String(findings),
    hint:
      findings === 0
        ? `Clear · last run ${checkedAt}`
        : `${critical} critical · ${warnings} warning${warnings === 1 ? "" : "s"} · ${checkedAt}`,
  };
}

export function buildAdminMetrics(overview: AdminOverview): MetricItem[] {
  const normalized = normalizeAdminOverview(overview);

  return [
    {
      label: "Total accounts",
      value: String(normalized.total_tribes),
      hint: `${normalized.creators} creators · ${normalized.admins} admins`,
    },
    {
      label: "Active creators",
      value: String(normalized.active_tribes),
      hint: `${normalized.pending_tribes} pending · ${normalized.suspended_tribes} suspended`,
    },
    {
      label: "Published pages",
      value: String(normalized.published_profiles),
      hint: `${normalized.onboarding_complete} with payout setup complete`,
    },
    {
      label: "Paid tips",
      value: String(normalized.paid_tips),
      hint: `${normalized.pending_tips} pending · ${normalized.failed_tips} failed`,
    },
    {
      label: "Paid volume",
      value: formatVolumeByCurrency(normalized.paid_volume_cents),
      hint: "Successful tips across all markets",
    },
    {
      label: "Last 30 days",
      value: formatVolumeByCurrency(normalized.volume_last_30_days_cents),
      hint: `${normalized.tips_last_30_days} paid tips`,
    },
    {
      label: "Pending volume",
      value: formatVolumeByCurrency(normalized.pending_volume_cents),
      hint: "Tips awaiting confirmation",
    },
    {
      label: "Payout accounts",
      value: String(normalized.payout_linked),
      hint: `${normalized.payout_customers} Paystack customers linked`,
    },
    {
      label: "Payment alerts",
      value: String(normalized.unresolved_payment_alerts),
      hint: "Unresolved drift and payout issues",
    },
    {
      label: "Failed webhooks",
      value: String(normalized.failed_webhooks),
      hint: "Events needing replay or investigation",
    },
    reconciliationMetric(normalized.reconciliation),
    {
      label: "Total tips",
      value: String(normalized.total_tips),
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

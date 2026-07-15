"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchAdminPaymentAlerts } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { runAfterPaint } from "@/lib/run-after-paint";
import { formatSettlementDate } from "@/lib/settlement-status";
import type { PaymentAlert } from "@/types/api";

type AdminPaymentAlertsPanelProps = {
  token: string | null;
};

function severityTone(severity: PaymentAlert["severity"]): string {
  if (severity === "critical") return "bg-red-50 text-red-900 ring-red-200";
  return "bg-amber-50 text-amber-950 ring-amber-200";
}

export function AdminPaymentAlertsPanel({ token }: AdminPaymentAlertsPanelProps) {
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unresolvedOnly, setUnresolvedOnly] = useState(true);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchAdminPaymentAlerts(token, {
        unresolved: unresolvedOnly,
        limit: 25,
      });
      setAlerts(payload.alerts);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token, unresolvedOnly]);

  useEffect(() => {
    runAfterPaint(() => loadAlerts());
  }, [loadAlerts]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-brand-900">Payment alerts</h3>
          <p className="text-sm text-brand-700">
            Operational issues detected by background reconciliation and webhook checks.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={unresolvedOnly ? "primary" : "secondary"}
            onClick={() => setUnresolvedOnly(true)}
          >
            Unresolved
          </Button>
          <Button
            type="button"
            variant={!unresolvedOnly ? "primary" : "secondary"}
            onClick={() => setUnresolvedOnly(false)}
          >
            All
          </Button>
          <Button type="button" variant="ghost" disabled={loading} onClick={() => void loadAlerts()}>
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading && alerts.length === 0 ? (
        <p className="text-sm text-brand-700">Loading payment alerts…</p>
      ) : alerts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-200 px-4 py-6 text-sm text-brand-700">
          {unresolvedOnly ? "No unresolved payment alerts." : "No payment alerts recorded yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="rounded-2xl border border-brand-100 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-brand-900">{alert.title}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${severityTone(alert.severity)}`}
                    >
                      {alert.severity}
                    </span>
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-700">
                      {alert.kind.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-brand-700">{alert.body}</p>
                  <p className="mt-2 text-xs text-brand-500">
                    {formatSettlementDate(alert.created_at)}
                    {alert.resolved_at
                      ? ` · Resolved ${formatSettlementDate(alert.resolved_at)}`
                      : ""}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

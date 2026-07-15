"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  fetchAdminPlatformReconciliation,
  runAdminPlatformReconciliation,
} from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { runAfterPaint } from "@/lib/run-after-paint";
import { formatSettlementDate } from "@/lib/settlement-status";
import type { PlatformReconciliationReport } from "@/types/api";

type AdminPlatformReconciliationPanelProps = {
  token: string | null;
};

function severityTone(severity: string): string {
  if (severity === "critical") return "bg-red-50 text-red-900 ring-red-200";
  return "bg-amber-50 text-amber-950 ring-amber-200";
}

export function AdminPlatformReconciliationPanel({ token }: AdminPlatformReconciliationPanelProps) {
  const [report, setReport] = useState<PlatformReconciliationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchAdminPlatformReconciliation(token);
      setReport(payload.reconciliation);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    runAfterPaint(() => loadReport());
  }, [loadReport]);

  async function handleRun(autoRepair: boolean) {
    setRunning(true);
    setError(null);

    try {
      const payload = await runAdminPlatformReconciliation(token, { autoRepair });
      setReport(payload.reconciliation);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setRunning(false);
    }
  }

  const summary = report?.summary;
  const findings = report?.findings ?? [];
  const neverRun = report?.status === "never_run";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-brand-900">Platform reconciliation</h3>
          <p className="text-sm text-brand-700">
            Cross-check tips, settlements, and onboarding drift across all creators.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={loading || running}
            onClick={() => void loadReport()}
          >
            {loading ? "Refreshing…" : "Refresh report"}
          </Button>
          <Button
            type="button"
            disabled={running}
            onClick={() => void handleRun(true)}
          >
            {running ? "Running…" : "Run with auto-repair"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={running}
            onClick={() => void handleRun(false)}
          >
            Audit only
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading && !report ? (
        <p className="text-sm text-brand-700">Loading reconciliation report…</p>
      ) : neverRun ? (
        <p className="rounded-xl border border-dashed border-brand-200 px-4 py-6 text-sm text-brand-700">
          {report?.message ?? "No platform reconciliation has completed yet."}
        </p>
      ) : (
        <>
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-widest text-brand-600">Findings</dt>
              <dd className="mt-2 text-2xl font-semibold text-brand-900">
                {summary?.findings_count ?? 0}
              </dd>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-white px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-widest text-brand-600">Critical</dt>
              <dd className="mt-2 text-2xl font-semibold text-red-800">
                {summary?.critical_count ?? 0}
              </dd>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-white px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-widest text-brand-600">Warnings</dt>
              <dd className="mt-2 text-2xl font-semibold text-amber-900">
                {summary?.warning_count ?? 0}
              </dd>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-white px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-widest text-brand-600">Checked</dt>
              <dd className="mt-2 text-sm font-medium text-brand-900">
                {summary?.creators_examined ?? 0} creators · {summary?.tips_verified ?? 0} tips
              </dd>
              {report?.checked_at && (
                <dd className="mt-1 text-xs text-brand-600">
                  Last run {formatSettlementDate(report.checked_at)}
                </dd>
              )}
            </div>
          </dl>

          {report?.repairs && (
            <p className="rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-brand-800">
              Auto-repair updated {report.repairs.pending_tips_reconciled} pending tips and synced{" "}
              {report.repairs.creators_synced} creators.
            </p>
          )}

          {findings.length > 0 ? (
            <ul className="space-y-3">
              {findings.map((finding, index) => (
                <li
                  key={`${finding.kind}-${index}`}
                  className="rounded-2xl border border-brand-100 bg-white px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-brand-900">{finding.title}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${severityTone(finding.severity)}`}
                    >
                      {finding.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-brand-700">{finding.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-700">No findings in the latest report.</p>
          )}
        </>
      )}
    </div>
  );
}

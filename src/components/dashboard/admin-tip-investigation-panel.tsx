"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { investigateAdminTip } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { getDisplayMessage } from "@/lib/errors";
import type { TipInvestigation } from "@/types/api";

type AdminTipInvestigationPanelProps = {
  token: string | null;
};

export function AdminTipInvestigationPanel({ token }: AdminTipInvestigationPanelProps) {
  const [reference, setReference] = useState("");
  const [investigation, setInvestigation] = useState<TipInvestigation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleInvestigate(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = reference.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const result = await investigateAdminTip(token, trimmed);
      setInvestigation(result);
    } catch (err) {
      setInvestigation(null);
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-brand-900">Investigate tip</h3>
        <p className="text-sm text-brand-700">
          Look up a Paystack reference to see payment events, webhook history, and account changes.
        </p>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => void handleInvestigate(e)}>
        <input
          type="text"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="tip_abc123..."
          className="flex-1 rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-900"
        />
        <Button type="submit" variant="secondary" disabled={loading || !reference.trim()}>
          {loading ? "Investigating…" : "Investigate"}
        </Button>
      </form>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {investigation && (
        <div className="space-y-5">
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm">
            <p className="font-medium text-brand-900">
              @{investigation.tip.tribe_username} · {investigation.tip.status}
              {investigation.tip.paid_via ? ` via ${investigation.tip.paid_via}` : ""}
            </p>
            <p className="mt-1 text-brand-700">
              {formatMoney(investigation.tip.amount_cents, investigation.tip.currency)} ·{" "}
              <span className="font-mono text-xs">{investigation.tip.paystack_reference}</span>
            </p>
            {investigation.tip.failed_reason && (
              <p className="mt-2 text-red-700">{investigation.tip.failed_reason}</p>
            )}
          </div>

          <section>
            <h4 className="mb-2 text-sm font-semibold text-brand-900">Tip timeline</h4>
            <div className="space-y-2">
              {investigation.tip_events.map((event) => (
                <div key={event.id} className="rounded-xl border border-brand-100 px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-brand-900">{event.action}</span>
                    <span className="text-brand-600">{event.source}</span>
                    {event.from_status && event.to_status && event.from_status !== event.to_status && (
                      <span className="text-brand-700">
                        {event.from_status} → {event.to_status}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-brand-600">
                    {new Date(event.created_at).toLocaleString()}
                    {event.request_id ? ` · req ${event.request_id.slice(0, 8)}` : ""}
                  </p>
                  {event.failed_reason && (
                    <p className="mt-1 text-xs text-red-700">{event.failed_reason}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold text-brand-900">Paystack webhooks</h4>
            <div className="space-y-2">
              {investigation.paystack_events.length === 0 ? (
                <p className="text-sm text-brand-700">No webhook events linked.</p>
              ) : (
                investigation.paystack_events.map((event) => (
                  <div key={event.id} className="rounded-xl border border-brand-100 px-3 py-2 text-sm">
                    <span className="font-medium text-brand-900">{event.event_type}</span>
                    <span className="ml-2 capitalize text-brand-700">{event.status}</span>
                    {event.error_message && (
                      <p className="mt-1 text-xs text-red-700">{event.error_message}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {investigation.admin_audit_logs.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-semibold text-brand-900">Admin actions</h4>
              <div className="space-y-2">
                {investigation.admin_audit_logs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-brand-100 px-3 py-2 text-sm">
                    <span className="font-medium text-brand-900">{log.action}</span>
                    <span className="ml-2 text-brand-700">
                      {log.target_type} {log.target_id.slice(0, 8)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  activateAdminTribe,
  fetchAdminPaystackAudit,
  fetchAdminTribes,
  suspendAdminTribe,
} from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import type { AdminOverview, AdminTribeSummary, PaystackAuditReport } from "@/types/api";
import { Button } from "@/components/ui/button";
import { PaystackVerificationChecks } from "@/components/paystack-verification-checks";

type AdminAccountsPanelProps = {
  token: string;
  onOverviewChange?: (overview: AdminOverview) => void;
};

export function AdminAccountsPanel({ token, onOverviewChange }: AdminAccountsPanelProps) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [tribes, setTribes] = useState<AdminTribeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [audit, setAudit] = useState<PaystackAuditReport | null>(null);
  const [auditLoading, setAuditLoading] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchAdminTribes(token, { q: search || undefined });
      setTribes(payload.tribes);
      onOverviewChange?.(payload.overview);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token, search, onOverviewChange]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSuspend(tribe: AdminTribeSummary) {
    setActionId(tribe.id);
    setError(null);

    try {
      const updated = await suspendAdminTribe(token, tribe.id);
      setTribes((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setActionId(null);
    }
  }

  async function handleActivate(tribe: AdminTribeSummary) {
    setActionId(tribe.id);
    setError(null);

    try {
      const updated = await activateAdminTribe(token, tribe.id);
      setTribes((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setActionId(null);
    }
  }

  async function handleAudit(tribe: AdminTribeSummary) {
    setAuditLoading(tribe.id);
    setError(null);

    try {
      const report = await fetchAdminPaystackAudit(token, tribe.id, { sync: true });
      setAudit(report);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setAuditLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(query.trim());
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by username or email"
          className="flex-1 rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-900"
        />
        <Button type="submit" variant="secondary" disabled={loading}>
          Search
        </Button>
        <Button type="button" variant="ghost" disabled={loading} onClick={() => void refresh()}>
          Refresh
        </Button>
      </form>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-brand-100">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-brand-100 bg-brand-50/60 text-brand-700">
            <tr>
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payout</th>
              <th className="px-4 py-3 font-medium">Tips</th>
              <th className="px-4 py-3 font-medium">Earned</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && tribes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-brand-600">
                  Loading accounts…
                </td>
              </tr>
            ) : tribes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-brand-600">
                  No accounts match your search.
                </td>
              </tr>
            ) : (
              tribes.map((tribe) => (
                <tr key={tribe.id} className="border-b border-brand-50 last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-900">@{tribe.username}</div>
                    <div className="text-xs text-brand-600">{tribe.email}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-brand-800">{tribe.role}</td>
                  <td className="px-4 py-3 capitalize text-brand-800">{tribe.account_status}</td>
                  <td className="px-4 py-3 text-brand-800">
                    {tribe.paystack_onboarding_complete
                      ? "Complete"
                      : tribe.paystack_subaccount_ready
                        ? "Subaccount linked"
                        : tribe.paystack_customer_ready
                          ? "Customer only"
                          : "Not started"}
                  </td>
                  <td className="px-4 py-3 text-brand-800">
                    {tribe.paid_tips_count} paid
                    {tribe.pending_tips_count > 0 ? ` · ${tribe.pending_tips_count} pending` : ""}
                  </td>
                  <td className="px-4 py-3 text-brand-800">
                    {formatMoney(tribe.total_earned_cents, tribe.currency)}
                  </td>
                  <td className="px-4 py-3 text-brand-800">
                    {tribe.is_profile_public ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {tribe.account_status === "suspended" ? (
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={actionId === tribe.id}
                          onClick={() => void handleActivate(tribe)}
                        >
                          Activate
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={actionId === tribe.id || tribe.role === "admin"}
                          onClick={() => void handleSuspend(tribe)}
                        >
                          Suspend
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={auditLoading === tribe.id}
                        onClick={() => void handleAudit(tribe)}
                      >
                        {auditLoading === tribe.id ? "Auditing…" : "Paystack audit"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {audit && (
        <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-brand-900">Paystack audit · @{audit.username}</h3>
              <p className="mt-1 text-sm text-brand-700">
                {audit.healthy ? "Healthy" : "Needs attention"}
              </p>
            </div>
            <Button type="button" variant="ghost" onClick={() => setAudit(null)}>
              Close
            </Button>
          </div>
          <PaystackVerificationChecks checks={audit.checks} />
        </div>
      )}
    </div>
  );
}

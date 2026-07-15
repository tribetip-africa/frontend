"use client";

import { useCallback, useEffect, useState } from "react";
import {
  activateAdminTribe,
  fetchAdminPaystackAudit,
  fetchAdminSettlements,
  fetchAdminTribes,
  repairAdminPaystackData,
  suspendAdminTribe,
} from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { runAfterPaint } from "@/lib/run-after-paint";
import { formatMoney } from "@/lib/money";
import {
  formatSettlementDate,
  settlementStatusLabel,
  settlementStatusTone,
} from "@/lib/settlement-status";
import type {
  AdminOverview,
  AdminSettlementsPayload,
  AdminTribeSummary,
  PaystackAuditReport,
  PaystackRepairResult,
} from "@/types/api";
import { Button } from "@/components/ui/button";
import { PaystackVerificationChecks } from "@/components/paystack-verification-checks";
import { RepairResultSummary } from "@/components/repair-result-summary";

const PAGE_SIZE = 25;

type AdminAccountsPanelProps = {
  token: string | null;
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
  const [auditTribeId, setAuditTribeId] = useState<string | null>(null);
  const [settlements, setSettlements] = useState<AdminSettlementsPayload | null>(null);
  const [repairLoading, setRepairLoading] = useState<string | null>(null);
  const [repairResult, setRepairResult] = useState<PaystackRepairResult | null>(null);
  const [repairUsername, setRepairUsername] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchAdminTribes(token, {
        q: search || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setTribes(payload.tribes);
      setTotal(payload.pagination.total);
      onOverviewChange?.(payload.overview);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token, search, offset, onOverviewChange]);

  useEffect(() => {
    runAfterPaint(() => refresh());
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
    setRepairResult(null);
    setRepairUsername(null);

    try {
      const [report, settlementPayload] = await Promise.all([
        fetchAdminPaystackAudit(token, tribe.id, { sync: true }),
        fetchAdminSettlements(token, tribe.id, { refresh: true }),
      ]);
      setAudit(report);
      setAuditTribeId(tribe.id);
      setSettlements(settlementPayload);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setAuditLoading(null);
    }
  }

  async function handleRepair(tribe: AdminTribeSummary) {
    setRepairLoading(tribe.id);
    setError(null);

    try {
      const payload = await repairAdminPaystackData(token, tribe.id);
      setRepairResult(payload.repair);
      setRepairUsername(payload.username);
      setAuditTribeId(tribe.id);

      if (audit && audit.username === tribe.username) {
        const settlementPayload = await fetchAdminSettlements(token, tribe.id, { refresh: true });
        setSettlements(settlementPayload);
      }

      await refresh();
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setRepairLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setOffset(0);
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
                      {tribe.role === "creator" && (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={repairLoading === tribe.id}
                          onClick={() => void handleRepair(tribe)}
                        >
                          {repairLoading === tribe.id ? "Syncing…" : "Sync Paystack"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-brand-700">
          <p>
            Showing {offset + 1}–{Math.min(offset + tribes.length, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading || offset === 0}
              onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading || offset + PAGE_SIZE >= total}
              onClick={() => setOffset((current) => current + PAGE_SIZE)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {audit && (
        <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-brand-900">Paystack audit · @{audit.username}</h3>
              <p className="mt-1 text-sm text-brand-700">
                {audit.healthy ? "Healthy" : "Needs attention"}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setAudit(null);
                setAuditTribeId(null);
                setSettlements(null);
                setRepairResult(null);
                setRepairUsername(null);
              }}
            >
              Close
            </Button>
          </div>
          <PaystackVerificationChecks checks={audit.checks} />
          {repairResult && repairUsername === audit.username && (
            <div className="mt-4">
              <RepairResultSummary result={repairResult} />
            </div>
          )}
          {settlements && auditTribeId && (
            <div className="mt-4 space-y-3 border-t border-brand-100 pt-4">
              <div>
                <h4 className="font-medium text-brand-900">Settlement history</h4>
                <p className="mt-1 text-xs text-brand-600">
                  {settlements.refreshed_at
                    ? `Last updated ${formatSettlementDate(settlements.refreshed_at)}`
                    : "Stored settlement records"}
                  {settlements.synced_at
                    ? ` · Synced with Paystack ${formatSettlementDate(settlements.synced_at)}`
                    : null}
                </p>
              </div>
              {settlements.settlements.length === 0 ? (
                <p className="text-sm text-brand-700">No settlement records yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-brand-100">
                  <table className="min-w-full divide-y divide-brand-100 text-sm">
                    <thead className="bg-brand-50/80 text-left text-brand-600">
                      <tr>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Amount</th>
                        <th className="px-3 py-2 font-medium">Destination</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-100 bg-white">
                      {settlements.settlements.map((settlement) => (
                        <tr key={settlement.id}>
                          <td className="px-3 py-2 text-brand-800">
                            {formatSettlementDate(settlement.settled_at)}
                          </td>
                          <td className="px-3 py-2 font-medium text-brand-900">
                            {formatMoney(
                              settlement.amount_cents,
                              settlement.currency ||
                                tribes.find((row) => row.id === auditTribeId)?.currency ||
                                "KES",
                            )}
                          </td>
                          <td className="px-3 py-2 text-brand-700">
                            {settlement.destination ?? "Linked payout account"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${settlementStatusTone(settlement.status)}`}
                            >
                              {settlementStatusLabel(settlement.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!audit && repairResult && repairUsername && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-brand-900">Paystack sync · @{repairUsername}</p>
          <RepairResultSummary result={repairResult} />
        </div>
      )}
    </div>
  );
}

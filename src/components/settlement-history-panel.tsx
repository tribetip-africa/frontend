"use client";

import { RevealablePayoutDestination } from "@/components/revealable-payout-destination";
import { formatMoney } from "@/lib/money";
import {
  formatSettlementDate,
  settlementStatusLabel,
  settlementStatusTone,
} from "@/lib/settlement-status";
import {
  settlementSourceLabel,
  settlementSourceTone,
} from "@/lib/settlement-source";
import type { PaystackSettlement } from "@/types/api";
import { Button } from "@/components/ui/button";

type SettlementHistoryPanelProps = {
  token?: string;
  settlements: PaystackSettlement[];
  currency: string;
  error: string | null;
  loading: boolean;
  onRefresh: () => void;
  refreshedAt?: string;
  syncedAt?: string;
  selectedSettlementId?: string | null;
  onSelectSettlement?: (settlementId: string) => void;
};

export function SettlementHistoryPanel({
  token,
  settlements,
  currency,
  error,
  loading,
  onRefresh,
  refreshedAt,
  syncedAt,
  selectedSettlementId,
  onSelectSettlement,
}: SettlementHistoryPanelProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-900">Settlement history</h2>
          <p className="mt-1 text-sm text-brand-700">
            Recent payouts from Paystack to your linked bank or mobile money account.
          </p>
          {(refreshedAt || syncedAt) && (
            <p className="mt-2 text-xs text-brand-600">
              {refreshedAt ? `Last updated ${formatSettlementDate(refreshedAt)}` : null}
              {refreshedAt && syncedAt ? " · " : null}
              {syncedAt ? `Synced with Paystack ${formatSettlementDate(syncedAt)}` : null}
            </p>
          )}
        </div>
        <Button type="button" variant="secondary" disabled={loading} onClick={onRefresh}>
          {loading ? "Refreshing…" : "Refresh history"}
        </Button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading && settlements.length === 0 ? (
        <p className="text-sm text-brand-700">Loading settlement history…</p>
      ) : settlements.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-200 px-4 py-6 text-sm text-brand-700">
          No settlements yet. Once tips are paid and Paystack settles your share, they will appear
          here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-100">
          <table className="min-w-full divide-y divide-brand-100 text-sm">
            <thead className="bg-brand-50/80 text-left text-brand-600">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 bg-white">
              {settlements.map((settlement) => (
                <tr
                  key={settlement.id}
                  className={selectedSettlementId === settlement.id ? "bg-brand-50/70" : undefined}
                >
                  <td className="px-4 py-3 text-brand-800">
                    {formatSettlementDate(settlement.settled_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-900">
                    {formatMoney(settlement.amount_cents, settlement.currency || currency)}
                  </td>
                  <td className="px-4 py-3 text-brand-700">
                    {settlement.destination ? (
                      <RevealablePayoutDestination
                        destination={settlement.destination}
                        token={token}
                      />
                    ) : (
                      "Linked payout account"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${settlementSourceTone(settlement.source)}`}
                    >
                      {settlementSourceLabel(settlement.source)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${settlementStatusTone(settlement.status)}`}
                    >
                      {settlementStatusLabel(settlement.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onSelectSettlement?.(settlement.id)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

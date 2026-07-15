"use client";

import { RevealablePayoutDestination } from "@/components/revealable-payout-destination";
import { formatMoney } from "@/lib/money";
import {
  formatSettlementDate,
  settlementStatusLabel,
  settlementStatusTone,
} from "@/lib/settlement-status";
import type { PaystackSettlement } from "@/types/api";

type WithdrawalHistoryPanelProps = {
  token?: string | null;
  withdrawals: PaystackSettlement[];
  currency: string;
  loading: boolean;
};

export function WithdrawalHistoryPanel({
  token,
  withdrawals,
  currency,
  loading,
}: WithdrawalHistoryPanelProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-brand-900">Recent withdrawals</h2>
        <p className="mt-1 text-sm text-brand-700">
          Manual withdrawal requests sent from TribeTip to your linked payout account.
        </p>
      </div>

      {loading && withdrawals.length === 0 ? (
        <p className="text-sm text-brand-700">Loading withdrawal history…</p>
      ) : withdrawals.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-200 px-4 py-6 text-sm text-brand-700">
          No manual withdrawals yet. When you withdraw available balance, they will appear here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-100">
          <table className="min-w-full divide-y divide-brand-100 text-sm">
            <thead className="bg-brand-50/80 text-left text-brand-600">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 bg-white">
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id}>
                  <td className="px-4 py-3 text-brand-800">
                    {formatSettlementDate(withdrawal.settled_at ?? withdrawal.updated_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-900">
                    {formatMoney(withdrawal.amount_cents, withdrawal.currency || currency)}
                  </td>
                  <td className="px-4 py-3 text-brand-700">
                    {withdrawal.destination ? (
                      <RevealablePayoutDestination
                        destination={withdrawal.destination}
                        token={token}
                      />
                    ) : (
                      "Linked payout account"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${settlementStatusTone(withdrawal.status)}`}
                    >
                      {settlementStatusLabel(withdrawal.status)}
                    </span>
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

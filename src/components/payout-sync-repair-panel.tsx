"use client";

import { useState } from "react";
import type { PaystackRepairResult } from "@/types/api";
import { PaystackSyncButton } from "@/components/paystack-sync-button";
import { RepairResultSummary } from "@/components/repair-result-summary";

type PayoutSyncRepairPanelProps = {
  token: string | null;
  onRepaired?: (result: PaystackRepairResult) => void;
};

export function PayoutSyncRepairPanel({ token, onRepaired }: PayoutSyncRepairPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaystackRepairResult | null>(null);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-brand-900">Sync with Paystack</h2>
        <p className="mt-1 text-sm text-brand-700">
          If a webhook was missed, this checks Paystack directly and updates your tips, settlements,
          and payout balances on TribeTip.
        </p>
      </div>

      <ul className="space-y-2 rounded-2xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm text-brand-700">
        <li>Re-checks pending tips against Paystack</li>
        <li>Pulls the latest settlement history into TribeTip</li>
        <li>Refreshes payout balances and earnings totals</li>
      </ul>

      <p className="text-xs text-brand-600">
        TribeTip also runs automatic recovery in the background: pending tips every 15 minutes,
        failed webhooks hourly, and settlement sync hourly.
      </p>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {result && <RepairResultSummary result={result} />}

      <PaystackSyncButton
        token={token}
        syncingLabel="Syncing with Paystack…"
        onRepaired={(repair) => {
          setResult(repair);
          onRepaired?.(repair);
        }}
        onError={setError}
      />
    </section>
  );
}

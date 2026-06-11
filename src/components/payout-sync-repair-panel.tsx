"use client";

import { useState } from "react";
import { repairPaystackData } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import type { PaystackRepairResult } from "@/types/api";
import { Button } from "@/components/ui/button";

type PayoutSyncRepairPanelProps = {
  token: string;
  onRepaired?: (result: PaystackRepairResult) => void;
};

export function PayoutSyncRepairPanel({ token, onRepaired }: PayoutSyncRepairPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaystackRepairResult | null>(null);

  async function handleRepair() {
    setLoading(true);
    setError(null);

    try {
      const payload = await repairPaystackData(token);
      setResult(payload.repair);
      onRepaired?.(payload.repair);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }

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

      {result && (
        <div className="rounded-2xl border border-green-100 bg-green-50/60 px-4 py-3 text-sm text-brand-800">
          <p className="font-medium text-brand-900">Sync complete</p>
          <ul className="mt-2 space-y-1">
            <li>{result.settlements_count} settlement records checked</li>
            <li>
              {result.tips_reconciled} of {result.tips_examined} pending tips updated
              {result.tips_still_pending > 0
                ? ` · ${result.tips_still_pending} still pending`
                : ""}
            </li>
          </ul>
        </div>
      )}

      <Button type="button" variant="secondary" disabled={loading} onClick={() => void handleRepair()}>
        {loading ? "Syncing with Paystack…" : "Sync with Paystack"}
      </Button>
    </section>
  );
}

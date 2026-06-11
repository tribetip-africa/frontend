"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMyTips, reconcileMyTip } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { getDisplayMessage } from "@/lib/errors";
import type { Tip } from "@/types/api";
import { Button } from "@/components/ui/button";

type TipsListProps = {
  token: string;
  refreshSignal?: number;
};

function formatTipDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusLabel(status: Tip["status"]): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
  }
}

export function TipsList({ token, refreshSignal = 0 }: TipsListProps) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);

  const loadTips = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setTips(await fetchMyTips(token));
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadTips();
  }, [loadTips, refreshSignal]);

  async function handleReconcile(tip: Tip) {
    setReconcilingId(tip.id);
    setError(null);

    try {
      const updated = await reconcileMyTip(token, tip.id);
      setTips((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setReconcilingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-brand-700">Loading tips…</p>;
  }

  if (error && tips.length === 0) {
    return (
      <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
        {error}
      </p>
    );
  }

  if (tips.length === 0) {
    return (
      <p className="text-sm text-brand-700">
        No tips yet. Share your public page to start receiving support.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <ul className="divide-y divide-brand-50">
        {tips.map((tip) => (
          <li key={tip.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="font-medium text-brand-900">
                {formatMoney(tip.amount_cents, tip.currency)}
              </p>
              <p className="truncate text-sm text-brand-700">
                {tip.supporter_name || tip.supporter_email}
              </p>
              {tip.message && (
                <p className="mt-1 text-sm text-brand-600">&ldquo;{tip.message}&rdquo;</p>
              )}
              <p className="mt-1 text-xs text-brand-500">{formatTipDate(tip.created_at)}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  tip.status === "paid"
                    ? "bg-green-50 text-green-800"
                    : tip.status === "pending"
                      ? "bg-amber-50 text-amber-900"
                      : "bg-red-50 text-red-800"
                }`}
              >
                {statusLabel(tip.status)}
              </span>
              {tip.status === "pending" && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={reconcilingId === tip.id}
                  onClick={() => void handleReconcile(tip)}
                >
                  {reconcilingId === tip.id ? "Checking…" : "Check with Paystack"}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

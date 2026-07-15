"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchMyTips, reconcileMyTip } from "@/lib/api";
import { runAfterPaint } from "@/lib/run-after-paint";
import { formatMoney } from "@/lib/money";
import { getDisplayMessage } from "@/lib/errors";
import { formatTipDate, tipStatusLabel, tipStatusTone } from "@/lib/tip-list-ui";
import { TipDetailDrawer } from "@/components/tip-detail-drawer";
import type { Tip } from "@/types/api";
import { Button } from "@/components/ui/button";

type TipsListProps = {
  token: string | null;
  refreshSignal?: number;
  previewLimit?: number;
  tips?: Tip[];
  loading?: boolean;
  error?: string | null;
};

type StatusFilter = "all" | Tip["status"];

export function TipsList({
  token,
  refreshSignal = 0,
  previewLimit,
  tips: controlledTips,
  loading: controlledLoading,
  error: controlledError,
}: TipsListProps) {
  const [internalTips, setInternalTips] = useState<Tip[]>([]);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(true);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const isControlled = controlledTips !== undefined;
  const isPreview = typeof previewLimit === "number";
  const tips = isControlled ? controlledTips : internalTips;
  const loading = isControlled ? (controlledLoading ?? false) : internalLoading;
  const error = isControlled ? (controlledError ?? null) : internalError;
  const selectedTip = tips.find((tip) => tip.id === selectedTipId) ?? null;

  const loadTips = useCallback(async () => {
    setInternalLoading(true);
    setInternalError(null);

    try {
      setInternalTips(await fetchMyTips(token));
    } catch (err) {
      setInternalError(getDisplayMessage(err));
    } finally {
      setInternalLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isControlled) return;
    runAfterPaint(() => loadTips());
  }, [isControlled, loadTips, refreshSignal]);

  async function handleReconcile(tip: Tip) {
    setReconcilingId(tip.id);
    if (!isControlled) {
      setInternalError(null);
    }

    try {
      const updated = await reconcileMyTip(token, tip.id);
      if (!isControlled) {
        setInternalTips((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      }
    } catch (err) {
      if (!isControlled) {
        setInternalError(getDisplayMessage(err));
      }
    } finally {
      setReconcilingId(null);
    }
  }

  const filteredTips =
    statusFilter === "all" ? tips : tips.filter((tip) => tip.status === statusFilter);
  const visibleTips = isPreview ? filteredTips.slice(0, previewLimit) : filteredTips;

  const content = (
    <>
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!isPreview && (
        <div className="flex flex-wrap gap-2">
          {(["all", "paid", "pending", "failed"] as const).map((filter) => (
            <Button
              key={filter}
              type="button"
              variant={statusFilter === filter ? "primary" : "secondary"}
              onClick={() => setStatusFilter(filter)}
            >
              {filter === "all" ? "All" : tipStatusLabel(filter)}
            </Button>
          ))}
        </div>
      )}

      {visibleTips.length === 0 ? (
        <p className="text-sm text-brand-700">
          {loading
            ? "Loading tips…"
            : isPreview
              ? "No tips yet. Share your public page to start receiving support."
              : "No tips match this filter."}
        </p>
      ) : (
        <ul className="divide-y divide-brand-50">
          {visibleTips.map((tip) => (
            <li
              key={tip.id}
              className={`flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0 ${
                isPreview ? "block" : ""
              }`}
            >
              <button
                type="button"
                className={`min-w-0 text-left ${isPreview ? "flex w-full items-start justify-between gap-4" : "flex-1"}`}
                onClick={() => setSelectedTipId(tip.id)}
              >
                <div className="min-w-0">
                  <p className="font-medium text-brand-900">
                    {formatMoney(tip.amount_cents, tip.currency)}
                  </p>
                  <p className="truncate text-sm text-brand-700">
                    {tip.supporter_name || tip.supporter_email || "Supporter"}
                  </p>
                  {!isPreview && tip.message && (
                    <p className="mt-1 text-sm text-brand-600">&ldquo;{tip.message}&rdquo;</p>
                  )}
                  <p className="mt-1 text-xs text-brand-500">{formatTipDate(tip.created_at)}</p>
                </div>
                {isPreview && (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${tipStatusTone(tip.status)}`}
                  >
                    {tipStatusLabel(tip.status)}
                  </span>
                )}
              </button>
              {!isPreview && (
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    type="button"
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tipStatusTone(tip.status)}`}
                    onClick={() => setSelectedTipId(tip.id)}
                  >
                    {tipStatusLabel(tip.status)}
                  </button>
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
              )}
            </li>
          ))}
        </ul>
      )}

      <TipDetailDrawer
        token={token}
        tipId={selectedTipId}
        initialTip={selectedTip}
        onClose={() => setSelectedTipId(null)}
        onTipUpdated={(updated) => {
          if (!isControlled) {
            setInternalTips((current) => current.map((row) => (row.id === updated.id ? updated : row)));
          }
        }}
      />
    </>
  );

  if (isPreview) {
    return (
      <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-brand-900">Recent tips</h2>
            <p className="mt-1 text-sm text-brand-700">Your latest supporter activity.</p>
          </div>
          <Link href="/dashboard/tips">
            <Button variant="ghost" type="button">
              View all
            </Button>
          </Link>
        </div>
        <div className="mt-4 space-y-3">{content}</div>
      </section>
    );
  }

  if (loading && tips.length === 0) {
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

  return <div className="space-y-3">{content}</div>;
}

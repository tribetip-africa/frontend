"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMyTip, reconcileMyTip } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import { runAfterPaint } from "@/lib/run-after-paint";
import {
  formatTipPaidVia,
  formatTipStatus,
  tipSupporterLabel,
} from "@/lib/tip-detail";
import type { Tip } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type TipDetailDrawerProps = {
  token: string;
  tipId: string | null;
  initialTip?: Tip | null;
  onClose: () => void;
  onTipUpdated?: (tip: Tip) => void;
};

function formatTipDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TipDetailDrawer({
  token,
  tipId,
  initialTip = null,
  onClose,
  onTipUpdated,
}: TipDetailDrawerProps) {
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconciling, setReconciling] = useState(false);

  const loadTip = useCallback(
    async (activeTipId: string, seedTip: Tip | null) => {
      setLoading(true);
      setError(null);
      setTip(seedTip);

      try {
        setTip(await fetchMyTip(token, activeTipId));
      } catch (err) {
        setError(getDisplayMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!tipId) return;

    let cancelled = false;
    const seedTip = initialTip?.id === tipId ? initialTip : null;

    runAfterPaint(() => {
      if (cancelled) return;
      void loadTip(tipId, seedTip);
    });

    return () => {
      cancelled = true;
    };
  }, [initialTip, loadTip, tipId]);

  async function handleReconcile() {
    if (!tip) return;

    setReconciling(true);
    setError(null);

    try {
      const updated = await reconcileMyTip(token, tip.id);
      setTip(updated);
      onTipUpdated?.(updated);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setReconciling(false);
    }
  }

  const paidViaLabel = tip ? formatTipPaidVia(tip.paid_via) : null;

  return (
    <Modal open={Boolean(tipId)} onClose={onClose} title="Tip details">
      {loading && !tip && <p className="text-sm text-brand-700">Loading tip…</p>}

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {tip && (
        <div className="space-y-4 text-sm text-brand-800">
          <div>
            <p className="text-2xl font-semibold text-brand-900">
              {formatMoney(tip.amount_cents, tip.currency)}
            </p>
            <p className="mt-1 text-brand-700">{tipSupporterLabel(tip)}</p>
          </div>

          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-bold uppercase tracking-widest text-brand-600">Status</dt>
              <dd className="mt-1 font-medium text-brand-900">{formatTipStatus(tip.status)}</dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-widest text-brand-600">Created</dt>
              <dd className="mt-1">{formatTipDate(tip.created_at)}</dd>
            </div>

            {tip.paid_at && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-brand-600">Paid</dt>
                <dd className="mt-1">{formatTipDate(tip.paid_at)}</dd>
              </div>
            )}

            {tip.message && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-brand-600">Message</dt>
                <dd className="mt-1">&ldquo;{tip.message}&rdquo;</dd>
              </div>
            )}

            <div>
              <dt className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Paystack reference
              </dt>
              <dd className="mt-1 font-mono text-xs">{tip.paystack_reference}</dd>
            </div>

            {paidViaLabel && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-brand-600">
                  Confirmation
                </dt>
                <dd className="mt-1">{paidViaLabel}</dd>
              </div>
            )}

            {tip.failed_reason && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-brand-600">
                  Failed reason
                </dt>
                <dd className="mt-1 text-red-800">{tip.failed_reason}</dd>
              </div>
            )}
          </dl>

          {tip.status === "pending" && (
            <Button
              type="button"
              variant="secondary"
              disabled={reconciling}
              onClick={() => void handleReconcile()}
            >
              {reconciling ? "Checking with Paystack…" : "Check with Paystack"}
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}

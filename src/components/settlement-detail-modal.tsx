"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { fetchPaystackSettlementDetail } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import {
  formatSettlementDate,
  settlementStatusLabel,
  settlementStatusTone,
} from "@/lib/settlement-status";
import type { SettlementDetailPayload } from "@/types/api";

type SettlementDetailModalProps = {
  token: string;
  settlementId: string | null;
  onClose: () => void;
};

export function SettlementDetailModal({
  token,
  settlementId,
  onClose,
}: SettlementDetailModalProps) {
  const [detail, setDetail] = useState<SettlementDetailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!settlementId) {
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPaystackSettlementDetail(token, settlementId)
      .then((payload) => {
        if (!cancelled) setDetail(payload);
      })
      .catch((err) => {
        if (!cancelled) setError(getDisplayMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [settlementId, token]);

  const settlement = detail?.settlement;
  const breakdown = detail?.breakdown;
  const tip = detail?.tip;

  return (
    <Modal
      open={Boolean(settlementId)}
      onClose={onClose}
      title="Settlement details"
    >
      {loading && <p className="text-sm text-brand-700">Loading settlement details…</p>}

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {settlement && breakdown && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold text-brand-900">
                {formatMoney(breakdown.net_cents, breakdown.currency)}
              </p>
              <p className="mt-1 text-sm text-brand-700">
                {formatSettlementDate(settlement.settled_at)} ·{" "}
                {settlement.destination ?? "Linked payout account"}
              </p>
            </div>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${settlementStatusTone(settlement.status)}`}
            >
              {settlementStatusLabel(settlement.status)}
            </span>
          </div>

          <dl className="grid gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-sm">
            {breakdown.gross_cents != null && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-brand-600">Tip amount</dt>
                  <dd className="font-medium text-brand-900">
                    {formatMoney(breakdown.gross_cents, breakdown.currency)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-brand-600">
                    Platform fee ({breakdown.platform_fee_percent}%)
                  </dt>
                  <dd className="font-medium text-brand-900">
                    {formatMoney(breakdown.platform_fee_cents ?? 0, breakdown.currency)}
                  </dd>
                </div>
              </>
            )}
            <div className="flex items-center justify-between gap-4 border-t border-brand-100 pt-3">
              <dt className="font-medium text-brand-800">Net settlement</dt>
              <dd className="font-semibold text-brand-900">
                {formatMoney(breakdown.net_cents, breakdown.currency)}
              </dd>
            </div>
          </dl>

          {tip ? (
            <div className="rounded-2xl border border-brand-100 p-4">
              <p className="font-medium text-brand-900">Linked tip</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-brand-600">Supporter</dt>
                  <dd className="text-brand-900">{tip.supporter_email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-brand-600">Tip amount</dt>
                  <dd className="text-brand-900">
                    {formatMoney(tip.amount_cents, tip.currency)}
                  </dd>
                </div>
                {tip.paid_at && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-brand-600">Paid at</dt>
                    <dd className="text-brand-900">{formatSettlementDate(tip.paid_at)}</dd>
                  </div>
                )}
                {tip.message && (
                  <div>
                    <dt className="text-brand-600">Message</dt>
                    <dd className="mt-1 text-brand-800">{tip.message}</dd>
                  </div>
                )}
              </dl>
            </div>
          ) : (
            <p className="text-sm text-brand-700">
              No linked tip was found for this settlement reference.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

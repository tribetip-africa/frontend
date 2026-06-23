"use client";

import { useState } from "react";
import { RevealablePayoutDestination } from "@/components/revealable-payout-destination";
import { Modal } from "@/components/ui/modal";
import { formatMoney } from "@/lib/money";
import type { PaystackWithdrawalsPayload, WithdrawalStatus } from "@/types/api";
import { Button } from "@/components/ui/button";

type WithdrawalPanelProps = {
  token?: string;
  payload: PaystackWithdrawalsPayload | null;
  error: string | null;
  loading: boolean;
  withdrawing: boolean;
  onRefresh: () => void;
  onWithdraw: () => Promise<unknown>;
};

export function isWithdrawalPanelVisible(status: WithdrawalStatus | undefined) {
  if (!status) return false;

  const mode = status.effective_payout_mode ?? status.payout_mode;
  return mode === "manual" || mode === "both";
}

export function WithdrawalPanel({
  token,
  payload,
  error,
  loading,
  withdrawing,
  onRefresh,
  onWithdraw,
}: WithdrawalPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const status = payload?.status;

  async function handleConfirm() {
    await onWithdraw();
    setConfirmOpen(false);
    onRefresh();
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-brand-900">Withdraw earnings</h2>
        <p className="mt-1 text-sm text-brand-700">
          Send your available balance from Paystack to your linked payout account.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-4">
        <p className="text-sm text-brand-600">Available to withdraw</p>
        <p className="mt-1 text-2xl font-semibold text-brand-900">
          {loading
            ? "…"
            : formatMoney(
                status?.available_to_withdraw_cents ?? 0,
                status?.currency ?? "KES",
              )}
        </p>
        {status?.destination && (
          <p className="mt-2 text-sm text-brand-700">
            To <RevealablePayoutDestination destination={status.destination} token={token} />
          </p>
        )}
        {status?.withdraw_blocker && !status.can_withdraw && (
          <p className="mt-2 text-sm text-amber-900">{status.withdraw_blocker}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={loading || withdrawing || !status?.can_withdraw}
          onClick={() => setConfirmOpen(true)}
        >
          {withdrawing ? "Withdrawing…" : "Withdraw available balance"}
        </Button>
        <Button type="button" variant="secondary" disabled={loading} onClick={onRefresh}>
          Refresh balance
        </Button>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm withdrawal"
      >
        <div className="space-y-4 text-sm text-brand-800">
          <p>
            Withdraw{" "}
            <span className="font-semibold text-brand-900">
              {formatMoney(
                status?.available_to_withdraw_cents ?? 0,
                status?.currency ?? "KES",
              )}
            </span>{" "}
            to{" "}
            {status?.destination ? (
              <RevealablePayoutDestination destination={status.destination} token={token} />
            ) : (
              "your linked payout account"
            )}
            ?
          </p>
          <p className="text-brand-600">
            This sends your full available balance. Processing usually completes within a few
            minutes.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={withdrawing} onClick={() => void handleConfirm()}>
              {withdrawing ? "Processing…" : "Confirm withdrawal"}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

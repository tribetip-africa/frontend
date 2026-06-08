"use client";

import type { PublicProfile } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { checkoutPhaseLabel, type TipCheckoutPhase } from "@/lib/tip-checkout";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type TipConfirmModalProps = {
  open: boolean;
  profile: PublicProfile;
  amountCents: number;
  supporterEmail: string;
  supporterName: string;
  message: string;
  checkoutPhase: TipCheckoutPhase;
  onClose: () => void;
  onConfirm: () => void;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-brand-600">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-brand-900">{value}</span>
    </div>
  );
}

export function TipConfirmModal({
  open,
  profile,
  amountCents,
  supporterEmail,
  supporterName,
  message,
  checkoutPhase,
  onClose,
  onConfirm,
}: TipConfirmModalProps) {
  const submitting = checkoutPhase !== "idle";
  const confirmLabel =
    checkoutPhase === "idle"
      ? `Confirm & pay ${formatMoney(amountCents, profile.currency)}`
      : checkoutPhaseLabel(checkoutPhase);

  return (
    <Modal open={open} onClose={onClose} title="Confirm your tip" disableClose={submitting}>
      <p className="text-sm text-brand-700">
        Review your details before continuing to Paystack checkout.
      </p>

      <dl className="mt-4 space-y-3 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
        <SummaryRow label="Creator" value={`@${profile.username}`} />
        <SummaryRow label="Amount" value={formatMoney(amountCents, profile.currency)} />
        <SummaryRow label="Email" value={supporterEmail.trim()} />
        {supporterName.trim() && (
          <SummaryRow label="Name" value={supporterName.trim()} />
        )}
        {message.trim() && <SummaryRow label="Message" value={message.trim()} />}
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-brand-600">
        You&apos;ll be redirected to Paystack to complete payment securely. Card and mobile money
        are supported.
      </p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          disabled={submitting}
          onClick={onClose}
          className="sm:min-w-28"
        >
          Go back
        </Button>
        <Button
          type="button"
          disabled={submitting}
          onClick={onConfirm}
          className="sm:min-w-40"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

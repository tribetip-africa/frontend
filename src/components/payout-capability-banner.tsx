import type { WithdrawalStatus } from "@/types/api";
import { buildPayoutCapabilityMessage } from "@/lib/payout-capability";

type PayoutCapabilityBannerProps = {
  status: WithdrawalStatus | undefined;
};

export function PayoutCapabilityBanner({ status }: PayoutCapabilityBannerProps) {
  const message = buildPayoutCapabilityMessage(status);
  if (!message) return null;

  const toneClass =
    message.tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : "border-brand-200 bg-accent-soft text-brand-800";

  return (
    <section className={`rounded-2xl border px-4 py-3 text-sm ${toneClass}`}>
      <p className="font-medium text-brand-900">{message.title}</p>
      <p className="mt-1">{message.body}</p>
      {status?.min_withdrawal_cents && status.min_withdrawal_cents > 0 && (
        <p className="mt-2 text-xs opacity-80">
          Minimum withdrawal: {(status.min_withdrawal_cents / 100).toFixed(0)} {status.currency}
        </p>
      )}
    </section>
  );
}

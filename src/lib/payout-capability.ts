import type { WithdrawalStatus } from "@/types/api";

export type PayoutCapabilityMessage = {
  title: string;
  body: string;
  tone: "info" | "warning";
};

export function buildPayoutCapabilityMessage(
  status: WithdrawalStatus | undefined,
): PayoutCapabilityMessage | null {
  if (!status) return null;

  const mode = status.effective_payout_mode ?? status.payout_mode;
  const tier = status.business_tier ?? "unknown";

  if (status.withdraw_blocker && !status.can_withdraw) {
    return {
      title: "Withdrawal temporarily unavailable",
      body: status.withdraw_blocker,
      tone: "warning",
    };
  }

  if (status.pending_withdrawal) {
    return {
      title: "Withdrawal in progress",
      body: "Paystack is processing your latest withdrawal. Balances refresh once it completes.",
      tone: "info",
    };
  }

  if (status.cooldown_ends_at) {
    const cooldown = new Date(status.cooldown_ends_at);
    if (!Number.isNaN(cooldown.getTime()) && cooldown.getTime() > Date.now()) {
      return {
        title: "Withdrawal cooldown active",
        body: `You can withdraw again after ${cooldown.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}.`,
        tone: "warning",
      };
    }
  }

  if (mode === "auto") {
    return {
      title: "Automatic settlement active",
      body:
        tier === "starter"
          ? "Paystack settles eligible earnings to your linked account on schedule. Manual withdrawals are not available on the Starter tier."
          : "Paystack settles eligible earnings to your linked account on schedule.",
      tone: "info",
    };
  }

  if (mode === "both") {
    return {
      title: "Auto settlement plus manual withdrawals",
      body: "Paystack can settle on schedule and you can also withdraw available balance when transfers are supported.",
      tone: "info",
    };
  }

  if (mode === "manual") {
    return {
      title: "Manual withdrawals enabled",
      body: "Withdraw available balance to your linked payout account when Paystack marks funds as ready.",
      tone: "info",
    };
  }

  return {
    title: "Payout mode",
    body: `Current payout mode: ${mode}.`,
    tone: "info",
  };
}

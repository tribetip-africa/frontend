import type { PaystackOnboardingPayload, PaystackPayoutStatus, WithdrawalStatus } from "@/types/api";

export const PAYSTACK_DASHBOARD_URL = "https://dashboard.paystack.com";

export function resolvePayout(
  payload: PaystackOnboardingPayload | null,
): PaystackPayoutStatus | null {
  if (!payload) return null;
  return payload.payout ?? payload.onboarding.payout ?? null;
}

export function payoutModeLabel(status: WithdrawalStatus | null | undefined): string {
  const mode = status?.effective_payout_mode ?? status?.payout_mode ?? "auto";
  if (mode === "manual") return "Manual withdrawals";
  if (mode === "both") return "Auto + manual";
  return "Auto settlement";
}

export function businessTierLabel(tier: string | undefined): string {
  switch (tier) {
    case "starter":
      return "Starter business";
    case "registered":
      return "Registered business";
    default:
      return "Paystack account";
  }
}

export function needsPaystackDashboardLink(status: WithdrawalStatus | null | undefined): boolean {
  if (!status) return false;

  const blocker = (status.withdraw_blocker ?? "").toLowerCase();
  if (
    blocker.includes("upgrade") ||
    blocker.includes("registered business") ||
    blocker.includes("transfer")
  ) {
    return true;
  }

  const wantsManual =
    status.configured_payout_mode === "manual" || status.configured_payout_mode === "both";

  return wantsManual && status.business_tier === "starter" && status.transfers_supported === false;
}

export function paystackDashboardReason(status: WithdrawalStatus | null | undefined): string {
  if (!status?.withdraw_blocker) {
    return "Upgrade your Paystack business tier or enable transfers in Paystack settings.";
  }
  return status.withdraw_blocker;
}

import type { CreatorProfile, PaystackOnboardingPayload, WithdrawalStatus } from "@/types/api";

export type PayoutCardData = {
  countryCode: string;
  currency: string;
  displayName: string;
  username: string;
  settlementBank?: string;
  accountNumber?: string;
  accountName?: string;
  verified: boolean;
  linked: boolean;
  pendingSettlementCents?: number;
  availableToWithdrawCents?: number;
  manualWithdrawMode?: boolean;
  totalEarnedCents?: number;
  pendingTipsCents?: number;
  totalVolumeCents?: number;
};

export function buildPayoutCardData(
  profile: CreatorProfile | null,
  username: string,
  payload: PaystackOnboardingPayload | null,
  withdrawalStatus?: WithdrawalStatus | null,
): PayoutCardData {
  const onboarding = payload?.onboarding ?? profile?.paystack_onboarding;
  const payout =
    payload?.payout ?? payload?.onboarding?.payout ?? profile?.paystack_onboarding?.payout;
  const market = payload?.market ?? profile?.paystack_onboarding?.market;
  const verified =
    payout?.subaccount_verified === true || onboarding?.subaccount_verified === true;
  const linked = onboarding?.subaccount_ready === true;

  const pendingSettlement =
    payout?.pending_settlement_cents ?? profile?.metrics?.pending_settlement_cents;
  const effectiveMode =
    withdrawalStatus?.effective_payout_mode ??
    withdrawalStatus?.payout_mode ??
    (payout?.settlement_schedule === "MANUAL" ? "manual" : "auto");
  const manualWithdrawMode =
    effectiveMode === "manual" ||
    effectiveMode === "both" ||
    payout?.settlement_schedule === "MANUAL";
  const availableToWithdrawCents =
    withdrawalStatus?.available_to_withdraw_cents ??
    payout?.available_to_settle_cents ??
    payout?.pending_settlement_cents;

  return {
    countryCode: profile?.country_code ?? market?.country_code ?? "KE",
    currency: profile?.currency ?? payout?.currency ?? market?.currency ?? "KES",
    displayName: profile?.display_name?.trim() || username,
    username,
    settlementBank: payout?.settlement_bank,
    accountNumber: payout?.account_number,
    accountName: payout?.account_name,
    verified,
    linked,
    pendingSettlementCents: pendingSettlement,
    availableToWithdrawCents,
    manualWithdrawMode,
    totalEarnedCents: profile?.metrics?.total_earned_cents,
    pendingTipsCents: profile?.metrics?.pending_tips_cents,
    totalVolumeCents: payout?.total_volume_cents,
  };
}

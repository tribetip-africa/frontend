import type { CreatorProfile, PaystackOnboardingPayload } from "@/types/api";

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
  totalEarnedCents?: number;
  pendingTipsCents?: number;
  totalVolumeCents?: number;
};

export function buildPayoutCardData(
  profile: CreatorProfile | null,
  username: string,
  payload: PaystackOnboardingPayload | null,
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

  return {
    countryCode: profile?.country_code ?? market?.country_code ?? "NG",
    currency: profile?.currency ?? payout?.currency ?? market?.currency ?? "NGN",
    displayName: profile?.display_name?.trim() || username,
    username,
    settlementBank: payout?.settlement_bank,
    accountNumber: payout?.account_number,
    accountName: payout?.account_name,
    verified,
    linked,
    pendingSettlementCents: pendingSettlement,
    totalEarnedCents: profile?.metrics?.total_earned_cents,
    pendingTipsCents: profile?.metrics?.pending_tips_cents,
    totalVolumeCents: payout?.total_volume_cents,
  };
}

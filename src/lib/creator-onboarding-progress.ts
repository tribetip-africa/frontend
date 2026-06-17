import type { CreatorMetrics, CreatorProfile, Tribe } from "@/types/api";
import {
  isPaystackOnboardingComplete,
  isPaystackSubaccountVerified,
} from "@/lib/paystack-onboarding";

export type OnboardingStepId =
  | "account"
  | "payout"
  | "verified"
  | "published"
  | "first_tip";

export type OnboardingStepStatus = "complete" | "current" | "upcoming";

export type OnboardingStep = {
  id: OnboardingStepId;
  label: string;
  description: string;
  status: OnboardingStepStatus;
};

export type CreatorPrimaryCta = {
  label: string;
  href: string;
  description: string;
};

type ProgressInput = {
  tribe: Pick<Tribe, "paystack_onboarding">;
  profile: Pick<
    CreatorProfile,
    "paystack_onboarding" | "is_profile_public" | "metrics"
  > | null;
};

function metricsSubaccountVerified(profile: ProgressInput["profile"]): boolean | undefined {
  return profile?.metrics?.subaccount_verified;
}

export function paidTipsCount(profile: ProgressInput["profile"]): number {
  return profile?.metrics?.paid_tips_count ?? 0;
}

export function isCreatorFullyLive(input: ProgressInput): boolean {
  const payoutLinked = isPaystackOnboardingComplete(input.tribe) ||
    isPaystackOnboardingComplete(input.profile);
  const verified = isPaystackSubaccountVerified(
    input.profile ?? input.tribe,
    metricsSubaccountVerified(input.profile),
  );
  const published = input.profile?.is_profile_public === true;
  const hasFirstTip = paidTipsCount(input.profile) > 0;

  return payoutLinked && verified && published && hasFirstTip;
}

export function buildCreatorOnboardingSteps(input: ProgressInput): OnboardingStep[] {
  const payoutLinked = isPaystackOnboardingComplete(input.tribe) ||
    isPaystackOnboardingComplete(input.profile);
  const verified = isPaystackSubaccountVerified(
    input.profile ?? input.tribe,
    metricsSubaccountVerified(input.profile),
  );
  const published = input.profile?.is_profile_public === true;
  const hasFirstTip = paidTipsCount(input.profile) > 0;

  const completions = [true, payoutLinked, verified, published, hasFirstTip];
  const currentIndex = completions.findIndex((done) => !done);

  const steps: Omit<OnboardingStep, "status">[] = [
    {
      id: "account",
      label: "Account",
      description: "Your TribeTip creator account is ready.",
    },
    {
      id: "payout",
      label: "Payout account",
      description: "Link M-Pesa or bank details through Paystack.",
    },
    {
      id: "verified",
      label: "Verification",
      description: "Paystack confirms your payout account.",
    },
    {
      id: "published",
      label: "Publish page",
      description: "Make your public tip page live.",
    },
    {
      id: "first_tip",
      label: "First tip",
      description: "Share your link and receive support.",
    },
  ];

  return steps.map((step, index) => ({
    ...step,
    status:
      index < currentIndex || currentIndex === -1
        ? "complete"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}

export function buildCreatorPrimaryCta(input: ProgressInput): CreatorPrimaryCta | null {
  if (isCreatorFullyLive(input)) {
    return null;
  }

  const payoutLinked = isPaystackOnboardingComplete(input.tribe) ||
    isPaystackOnboardingComplete(input.profile);
  const verified = isPaystackSubaccountVerified(
    input.profile ?? input.tribe,
    metricsSubaccountVerified(input.profile),
  );
  const published = input.profile?.is_profile_public === true;

  if (!payoutLinked) {
    return {
      label: "Link payout account",
      href: "/dashboard",
      description: "Complete Paystack setup to receive tips and payouts.",
    };
  }

  if (!verified) {
    return {
      label: "Finish payout setup",
      href: "/dashboard/public-page",
      description: "Add your profile while Paystack verifies your payout account.",
    };
  }

  if (!published) {
    return {
      label: "Publish your page",
      href: "/dashboard/public-page",
      description: "Your payout account is verified. Publish to unlock your public link.",
    };
  }

  return {
    label: "Share your tip page",
    href: "/dashboard/public-page",
    description: "Copy your link or QR code to get your first tip.",
  };
}

export function buildEarningsSnapshot(
  metrics: CreatorMetrics | null | undefined,
  availableToWithdrawCents?: number,
  currencyFallback = "KES",
): {
  currency: string;
  totalEarnedCents: number;
  tipsLast30DaysCents: number;
  availableToWithdrawCents: number;
  pendingTipsCount: number;
  pendingTipsCents: number;
} {
  const currency = metrics?.currency ?? currencyFallback;

  return {
    currency,
    totalEarnedCents: metrics?.total_earned_cents ?? 0,
    tipsLast30DaysCents: metrics?.tips_last_30_days_cents ?? 0,
    availableToWithdrawCents: availableToWithdrawCents ?? metrics?.pending_settlement_cents ?? 0,
    pendingTipsCount: metrics?.pending_tips_count ?? 0,
    pendingTipsCents: metrics?.pending_tips_cents ?? 0,
  };
}

export const STALE_PENDING_TIP_MS = 15 * 60 * 1000;

export function countStalePendingTips(
  tips: Array<{ status: string; created_at: string }>,
  nowMs = Date.now(),
): number {
  return tips.filter((tip) => {
    if (tip.status !== "pending") return false;

    const createdAt = new Date(tip.created_at).getTime();
    if (Number.isNaN(createdAt)) return false;

    return nowMs - createdAt >= STALE_PENDING_TIP_MS;
  }).length;
}

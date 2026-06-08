import type { CreatorProfile, Tribe } from "@/types/api";

export type AccountStatusBanner = {
  tone: "info" | "warning" | "danger";
  message: string;
};

export type AccountStatusBannerInput = {
  account_status: Tribe["account_status"];
  paystack_onboarding: Tribe["paystack_onboarding"];
  is_profile_public?: boolean;
  metrics_subaccount_verified?: boolean;
};

export function isPaystackOnboardingComplete(
  tribe: Pick<Tribe, "paystack_onboarding"> | null | undefined,
): boolean {
  return tribe?.paystack_onboarding?.complete === true;
}

export function isPaystackSubaccountVerified(
  tribe: Pick<Tribe, "paystack_onboarding"> | null | undefined,
  metricsSubaccountVerified?: boolean,
): boolean {
  if (metricsSubaccountVerified === true) return true;

  const onboarding = tribe?.paystack_onboarding;
  if (!onboarding) return false;

  if (onboarding.subaccount_verified === true) return true;
  return onboarding.payout?.subaccount_verified === true;
}

export function paystackPublishBlocker(
  tribe: Pick<Tribe, "paystack_onboarding"> | null | undefined,
): string | null {
  return tribe?.paystack_onboarding?.payout?.publish_blocker ?? null;
}

export function accountStatusBannerFrom(
  input: AccountStatusBannerInput,
): AccountStatusBanner | null {
  const tribe = {
    account_status: input.account_status,
    paystack_onboarding: input.paystack_onboarding,
  };

  if (tribe.account_status === "suspended") {
    return {
      tone: "danger",
      message: "Your account is suspended. Contact support if you think this is a mistake.",
    };
  }

  if (!isPaystackOnboardingComplete(tribe)) {
    return {
      tone: "warning",
      message: "Link your payout account to publish your page and receive tips.",
    };
  }

  if (!isPaystackSubaccountVerified(tribe, input.metrics_subaccount_verified)) {
    return {
      tone: "warning",
      message:
        paystackPublishBlocker(tribe) ??
        "Paystack is verifying your payout account. You can finish your profile, but publishing unlocks once verification completes.",
    };
  }

  if (tribe.account_status === "pending" && !input.is_profile_public) {
    return {
      tone: "info",
      message:
        "Your payout account is verified. Finish your profile below, then publish your page to start receiving tips.",
    };
  }

  return null;
}

export function accountStatusBanner(
  tribe: Pick<Tribe, "account_status" | "paystack_onboarding">,
): AccountStatusBanner | null {
  return accountStatusBannerFrom({
    account_status: tribe.account_status,
    paystack_onboarding: tribe.paystack_onboarding,
  });
}

export function accountStatusBannerForCreator(
  tribe: Pick<Tribe, "account_status" | "paystack_onboarding">,
  profile: Pick<
    CreatorProfile,
    "account_status" | "paystack_onboarding" | "is_profile_public" | "metrics"
  > | null,
): AccountStatusBanner | null {
  return accountStatusBannerFrom({
    account_status: profile?.account_status ?? tribe.account_status,
    paystack_onboarding: profile?.paystack_onboarding ?? tribe.paystack_onboarding,
    is_profile_public: profile?.is_profile_public,
    metrics_subaccount_verified: profile?.metrics?.subaccount_verified,
  });
}

import {
  accountStatusBanner,
  accountStatusBannerForCreator,
  isPaystackOnboardingComplete,
} from "@/lib/paystack-onboarding";

describe("paystack onboarding helpers", () => {
  it("detects completed onboarding", () => {
    expect(
      isPaystackOnboardingComplete({
        paystack_onboarding: {
          customer_ready: true,
          subaccount_ready: true,
          complete: true,
        },
      }),
    ).toBe(true);
  });

  it("treats a linked subaccount as complete enough to unlock the dashboard", () => {
    expect(
      isPaystackOnboardingComplete({
        paystack_onboarding: {
          customer_ready: true,
          subaccount_ready: true,
          complete: false,
        },
      }),
    ).toBe(true);
  });

  it("treats missing onboarding data as incomplete", () => {
    expect(isPaystackOnboardingComplete(null)).toBe(false);
    expect(isPaystackOnboardingComplete(undefined)).toBe(false);
    expect(
      isPaystackOnboardingComplete({
        paystack_onboarding: {
          customer_ready: true,
          subaccount_ready: false,
          complete: false,
        },
      }),
    ).toBe(false);
  });

  it("returns payout setup banner when onboarding is incomplete", () => {
    const banner = accountStatusBanner({
      account_status: "pending",
      paystack_onboarding: {
        customer_ready: true,
        subaccount_ready: false,
        complete: false,
      },
    });

    expect(banner?.message).toMatch(/payout account/i);
    expect(banner?.tone).toBe("warning");
  });

  it("returns guidance when payout setup is complete but account is pending", () => {
    const banner = accountStatusBanner({
      account_status: "pending",
      paystack_onboarding: {
        customer_ready: true,
        subaccount_ready: true,
        complete: true,
        subaccount_verified: true,
      },
    });

    expect(banner?.message).toMatch(/verified/i);
    expect(banner?.tone).toBe("info");
  });

  it("returns verification banner when payout is linked but not verified", () => {
    const banner = accountStatusBanner({
      account_status: "active",
      paystack_onboarding: {
        customer_ready: true,
        subaccount_ready: true,
        complete: true,
        subaccount_verified: false,
        payout: {
          subaccount_verified: false,
          publish_blocker: "Paystack is still verifying your payout account.",
        },
      },
    });

    expect(banner?.message).toMatch(/verifying/i);
    expect(banner?.tone).toBe("warning");
  });

  it("returns suspended banner copy", () => {
    expect(
      accountStatusBanner({
        account_status: "suspended",
        paystack_onboarding: {
          customer_ready: false,
          subaccount_ready: false,
          complete: false,
        },
      })?.tone,
    ).toBe("danger");
  });

  it("returns null for active accounts with completed onboarding", () => {
    expect(
      accountStatusBanner({
        account_status: "active",
        paystack_onboarding: {
          customer_ready: true,
          subaccount_ready: true,
          complete: true,
          subaccount_verified: true,
        },
      }),
    ).toBeNull();
  });

  it("hides the banner for published creators with verified payouts", () => {
    expect(
      accountStatusBannerForCreator(
        {
          account_status: "active",
          paystack_onboarding: {
            customer_ready: true,
            subaccount_ready: true,
            complete: true,
            subaccount_verified: false,
          },
        },
        {
          account_status: "active",
          is_profile_public: true,
          paystack_onboarding: {
            customer_ready: true,
            subaccount_ready: true,
            complete: true,
            subaccount_verified: true,
          },
          metrics: { subaccount_verified: true } as never,
        },
      ),
    ).toBeNull();
  });

  it("uses fresh profile verification even when stored tribe omits it", () => {
    expect(
      accountStatusBannerForCreator(
        {
          account_status: "active",
          paystack_onboarding: {
            customer_ready: true,
            subaccount_ready: true,
            complete: true,
          },
        },
        {
          account_status: "active",
          is_profile_public: true,
          paystack_onboarding: {
            customer_ready: true,
            subaccount_ready: true,
            complete: true,
            subaccount_verified: true,
          },
          metrics: { subaccount_verified: true } as never,
        },
      ),
    ).toBeNull();
  });
});

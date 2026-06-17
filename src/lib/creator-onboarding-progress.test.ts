import {
  buildCreatorOnboardingSteps,
  buildCreatorPrimaryCta,
  buildEarningsSnapshot,
  countStalePendingTips,
  isCreatorFullyLive,
  STALE_PENDING_TIP_MS,
} from "@/lib/creator-onboarding-progress";

const payoutLinkedTribe = {
  paystack_onboarding: {
    customer_ready: true,
    subaccount_ready: true,
    complete: true,
    subaccount_verified: true,
  },
};

const verifiedPublishedProfile = {
  paystack_onboarding: {
    customer_ready: true,
    subaccount_ready: true,
    complete: true,
    subaccount_verified: true,
  },
  is_profile_public: true,
  metrics: {
    paid_tips_count: 0,
    pending_tips_count: 0,
    failed_tips_count: 0,
    total_earned_cents: 0,
    pending_tips_cents: 0,
    tips_last_30_days_count: 0,
    tips_last_30_days_cents: 0,
    currency: "KES",
  },
};

describe("creator onboarding progress", () => {
  it("marks account complete and payout as current when payout is not linked", () => {
    const steps = buildCreatorOnboardingSteps({
      tribe: {
        paystack_onboarding: {
          customer_ready: true,
          subaccount_ready: false,
          complete: false,
        },
      },
      profile: null,
    });

    expect(steps[0]?.status).toBe("complete");
    expect(steps[1]?.status).toBe("current");
    expect(steps[2]?.status).toBe("upcoming");
  });

  it("returns link payout CTA when onboarding is incomplete", () => {
    const cta = buildCreatorPrimaryCta({
      tribe: {
        paystack_onboarding: {
          customer_ready: true,
          subaccount_ready: false,
          complete: false,
        },
      },
      profile: null,
    });

    expect(cta?.label).toBe("Link payout account");
    expect(cta?.href).toBe("/dashboard");
  });

  it("returns publish CTA when verified but page is still draft", () => {
    const cta = buildCreatorPrimaryCta({
      tribe: payoutLinkedTribe,
      profile: {
        ...verifiedPublishedProfile,
        is_profile_public: false,
      },
    });

    expect(cta?.label).toBe("Publish your page");
    expect(cta?.href).toBe("/dashboard/public-page");
  });

  it("returns share CTA when published but no tips yet", () => {
    const cta = buildCreatorPrimaryCta({
      tribe: payoutLinkedTribe,
      profile: verifiedPublishedProfile,
    });

    expect(cta?.label).toBe("Share your tip page");
  });

  it("detects fully live creators", () => {
    expect(
      isCreatorFullyLive({
        tribe: payoutLinkedTribe,
        profile: {
          ...verifiedPublishedProfile,
          metrics: {
            ...verifiedPublishedProfile.metrics,
            paid_tips_count: 2,
          },
        },
      }),
    ).toBe(true);

    expect(
      buildCreatorPrimaryCta({
        tribe: payoutLinkedTribe,
        profile: {
          ...verifiedPublishedProfile,
          metrics: {
            ...verifiedPublishedProfile.metrics,
            paid_tips_count: 2,
          },
        },
      }),
    ).toBeNull();
  });

  it("builds earnings snapshot with withdrawal override", () => {
    const snapshot = buildEarningsSnapshot(
      {
        paid_tips_count: 3,
        pending_tips_count: 1,
        failed_tips_count: 0,
        total_earned_cents: 5000,
        pending_tips_cents: 1000,
        tips_last_30_days_count: 2,
        tips_last_30_days_cents: 3000,
        currency: "KES",
        pending_settlement_cents: 2000,
      },
      4500,
    );

    expect(snapshot.totalEarnedCents).toBe(5000);
    expect(snapshot.availableToWithdrawCents).toBe(4500);
    expect(snapshot.pendingTipsCount).toBe(1);
  });

  it("counts stale pending tips older than 15 minutes", () => {
    const now = Date.parse("2026-06-16T12:00:00.000Z");

    expect(
      countStalePendingTips(
        [
          {
            status: "pending",
            created_at: new Date(now - STALE_PENDING_TIP_MS - 1).toISOString(),
          },
          {
            status: "pending",
            created_at: new Date(now - 5 * 60 * 1000).toISOString(),
          },
          {
            status: "paid",
            created_at: new Date(now - STALE_PENDING_TIP_MS - 1).toISOString(),
          },
        ],
        now,
      ),
    ).toBe(1);
  });
});

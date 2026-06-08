import { buildCreatorMetrics } from "@/components/creator-metrics-panel";
import { buildAdminMetrics } from "@/components/admin-metrics-panel";
import type { AdminOverview, CreatorMetrics } from "@/types/api";

describe("dashboard metrics", () => {
  it("builds creator metric cards", () => {
    const metrics: CreatorMetrics = {
      paid_tips_count: 3,
      pending_tips_count: 1,
      failed_tips_count: 0,
      total_earned_cents: 150_000,
      pending_tips_cents: 50_000,
      tips_last_30_days_count: 2,
      tips_last_30_days_cents: 100_000,
      last_paid_at: "2026-06-01T10:00:00Z",
      currency: "KES",
      pending_settlement_cents: 75_000,
      subaccount_verified: true,
    };

    const cards = buildCreatorMetrics(metrics, true);

    expect(cards[0]?.label).toBe("Total earned");
    expect(cards[0]?.value).toMatch(/1,500|1500/);
    expect(cards.find((card) => card.label === "Public page")?.value).toBe("Live");
  });

  it("builds admin platform metric cards", () => {
    const overview: AdminOverview = {
      total_tribes: 10,
      active_tribes: 8,
      suspended_tribes: 1,
      pending_tribes: 1,
      published_profiles: 5,
      admins: 1,
      creators: 9,
      total_tips: 20,
      paid_tips: 15,
      pending_tips: 3,
      failed_tips: 2,
      paid_volume_cents: { KES: 200_000 },
      pending_volume_cents: { KES: 50_000 },
      onboarding_complete: 6,
      payout_linked: 6,
      payout_customers: 7,
      tips_last_30_days: 8,
      volume_last_30_days_cents: { KES: 120_000 },
    };

    const cards = buildAdminMetrics(overview);

    expect(cards.find((card) => card.label === "Paid tips")?.value).toBe("15");
    expect(cards.find((card) => card.label === "Paid volume")?.value).toMatch(/2,000|2000/);
  });
});

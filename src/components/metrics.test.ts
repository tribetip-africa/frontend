import { buildCreatorMetrics } from "@/lib/creator-metrics";
import {
  buildCreatorOverviewMetrics,
  formatCheckoutSuccessRate,
} from "@/lib/creator-overview-metrics";
import { buildAdminMetrics, normalizeAdminOverview } from "@/components/admin-metrics-panel";
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

  it("builds creator overview metric cards with average tip and checkout success", () => {
    const metrics: CreatorMetrics = {
      paid_tips_count: 4,
      pending_tips_count: 1,
      failed_tips_count: 1,
      total_earned_cents: 200_000,
      pending_tips_cents: 50_000,
      tips_last_30_days_count: 2,
      tips_last_30_days_cents: 100_000,
      currency: "KES",
    };

    const cards = buildCreatorOverviewMetrics({
      metrics,
      availableToWithdrawCents: 25_000,
      totalSettledCents: 150_000,
      currencyFallback: "KES",
    });

    expect(cards.find((card) => card.label === "Average tip")?.value).toMatch(/500|5,000/);
    expect(cards.find((card) => card.label === "Checkout success")?.value).toBe("80%");
    expect(cards.find((card) => card.label === "Total settled")?.value).toMatch(/1,500|1500/);
    expect(formatCheckoutSuccessRate(metrics).hint).toBe("4 of 5 checkouts paid");
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
      unresolved_payment_alerts: 2,
      failed_webhooks: 1,
      reconciliation: {
        never_run: false,
        checked_at: "2026-06-20T10:00:00.000Z",
        findings_count: 3,
        critical_count: 1,
        warning_count: 2,
      },
    };

    const cards = buildAdminMetrics(overview);

    expect(cards.find((card) => card.label === "Paid tips")?.value).toBe("15");
    expect(cards.find((card) => card.label === "Paid volume")?.value).toMatch(/2,000|2000/);
    expect(cards.find((card) => card.label === "Payment alerts")?.value).toBe("2");
    expect(cards.find((card) => card.label === "Failed webhooks")?.value).toBe("1");
    expect(cards.find((card) => card.label === "Reconciliation")?.value).toBe("3");
  });

  it("defaults missing ops metrics when the API omits them", () => {
    const overview = {
      total_tribes: 1,
      active_tribes: 1,
      suspended_tribes: 0,
      pending_tribes: 0,
      published_profiles: 0,
      admins: 1,
      creators: 0,
      total_tips: 0,
      paid_tips: 0,
      pending_tips: 0,
      failed_tips: 0,
      paid_volume_cents: {},
      pending_volume_cents: {},
      onboarding_complete: 0,
      payout_linked: 0,
      payout_customers: 0,
      tips_last_30_days: 0,
      volume_last_30_days_cents: {},
    };

    const normalized = normalizeAdminOverview(overview);
    const cards = buildAdminMetrics(normalized);

    expect(normalized.reconciliation.never_run).toBe(true);
    expect(cards.find((card) => card.label === "Payment alerts")?.value).toBe("0");
    expect(cards.find((card) => card.label === "Failed webhooks")?.value).toBe("0");
    expect(cards.find((card) => card.label === "Reconciliation")?.hint).toMatch(/no platform audit/i);
  });
});

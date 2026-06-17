import {
  buildSettlementHealth,
  pickLatestSettlement,
} from "@/lib/creator-settlement-snapshot";

describe("creator settlement snapshot", () => {
  it("picks the most recent settlement by settled_at", () => {
    const latest = pickLatestSettlement([
      {
        id: "older",
        amount_cents: 1000,
        currency: "KES",
        status: "success",
        settled_at: "2026-06-10T10:00:00.000Z",
      },
      {
        id: "newer",
        amount_cents: 2000,
        currency: "KES",
        status: "success",
        settled_at: "2026-06-15T10:00:00.000Z",
      },
    ]);

    expect(latest?.id).toBe("newer");
  });

  it("builds settlement health from summary and latest settlement", () => {
    const health = buildSettlementHealth(
      {
        total_settled_cents: 5000,
        successful_settlements_count: 2,
        failed_settlements_count: 1,
        last_settled_at: "2026-06-15T10:00:00.000Z",
        currency: "KES",
      },
      {
        id: "settlement-1",
        amount_cents: 2000,
        currency: "KES",
        status: "success",
        settled_at: "2026-06-15T10:00:00.000Z",
        destination: "MPESA",
      },
    );

    expect(health.lastSettlementId).toBe("settlement-1");
    expect(health.failedSettlementsCount).toBe(1);
    expect(health.lastSettlementDestination).toBe("MPESA");
  });
});

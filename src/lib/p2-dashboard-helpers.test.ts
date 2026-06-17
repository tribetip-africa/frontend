import { buildRepairSummaryLines } from "@/lib/repair-result-summary";
import { buildSupporterExportCsv } from "@/lib/supporter-export";
import { settlementSourceLabel } from "@/lib/settlement-source";
import { buildPayoutCapabilityMessage } from "@/lib/payout-capability";

describe("repair result summary", () => {
  it("builds repair summary lines from payout and earnings", () => {
    const lines = buildRepairSummaryLines({
      settlements_count: 3,
      tips_examined: 2,
      tips_reconciled: 1,
      tips_still_pending: 1,
      settlement_summary: {
        total_settled_cents: 5000,
        successful_settlements_count: 2,
        failed_settlements_count: 1,
        currency: "KES",
      },
      earnings: {
        paid_tips_count: 2,
        pending_tips_count: 1,
        failed_tips_count: 0,
        total_earned_cents: 7000,
        pending_tips_cents: 1000,
        tips_last_30_days_count: 2,
        tips_last_30_days_cents: 7000,
        currency: "KES",
      },
      payout: {
        available_to_settle_cents: 2500,
        currency: "KES",
      },
    });

    expect(lines.some((line) => line.label === "Available balance")).toBe(true);
    expect(lines.some((line) => line.label === "Total earned")).toBe(true);
  });
});

describe("supporter export", () => {
  it("builds a csv with supporter rows", () => {
    const csv = buildSupporterExportCsv([
      {
        id: "tip-1",
        tribe_id: "tribe-1",
        amount_cents: 50000,
        currency: "KES",
        status: "paid",
        paystack_reference: "ref_123",
        supporter_email: "fan@example.com",
        supporter_name: "Fan",
        message: "Keep going",
        paid_at: "2026-06-15T10:00:00.000Z",
        created_at: "2026-06-15T09:55:00.000Z",
      },
    ]);

    expect(csv).toContain("Supporter");
    expect(csv).toContain("fan@example.com");
    expect(csv).toContain("Keep going");
  });
});

describe("settlement source labels", () => {
  it("labels manual withdrawals", () => {
    expect(settlementSourceLabel("manual_withdrawal")).toBe("Manual withdrawal");
  });
});

describe("payout capability", () => {
  it("returns a blocker message when withdrawals are blocked", () => {
    const message = buildPayoutCapabilityMessage({
      payout_mode: "manual",
      available_to_withdraw_cents: 0,
      min_withdrawal_cents: 100,
      can_withdraw: false,
      withdraw_blocker: "Balance below minimum withdrawal.",
      currency: "KES",
    });

    expect(message?.body).toContain("minimum withdrawal");
    expect(message?.tone).toBe("warning");
  });
});

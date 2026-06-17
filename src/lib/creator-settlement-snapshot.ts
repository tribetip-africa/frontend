import type { PaystackSettlement, SettlementSummary } from "@/types/api";

export function pickLatestSettlement(
  settlements: PaystackSettlement[],
): PaystackSettlement | null {
  if (settlements.length === 0) return null;

  return [...settlements].sort((left, right) => {
    const leftTime = settlementSortTime(left);
    const rightTime = settlementSortTime(right);
    return rightTime - leftTime;
  })[0] ?? null;
}

function settlementSortTime(settlement: PaystackSettlement): number {
  const value = settlement.settled_at ?? settlement.updated_at;
  if (!value) return 0;

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function buildSettlementHealth(
  summary: SettlementSummary | null | undefined,
  latestSettlement: PaystackSettlement | null,
): {
  currency: string;
  lastSettledAt?: string | null;
  lastSettlementAmountCents?: number;
  lastSettlementStatus?: PaystackSettlement["status"];
  lastSettlementDestination?: string;
  lastSettlementId?: string;
  failedSettlementsCount: number;
  successfulSettlementsCount: number;
} {
  return {
    currency: summary?.currency ?? latestSettlement?.currency ?? "KES",
    lastSettledAt: summary?.last_settled_at ?? latestSettlement?.settled_at ?? null,
    lastSettlementAmountCents: latestSettlement?.amount_cents,
    lastSettlementStatus: latestSettlement?.status,
    lastSettlementDestination: latestSettlement?.destination,
    lastSettlementId: latestSettlement?.id,
    failedSettlementsCount: summary?.failed_settlements_count ?? 0,
    successfulSettlementsCount: summary?.successful_settlements_count ?? 0,
  };
}

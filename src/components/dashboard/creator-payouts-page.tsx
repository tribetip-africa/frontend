"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PayoutCard } from "@/components/payout-card/payout-card";
import { PayoutEarningsSummary } from "@/components/payout-earnings-summary";
import { PayoutSyncRepairPanel } from "@/components/payout-sync-repair-panel";
import { PaystackPayoutStatusPanel } from "@/components/paystack-payout-status-panel";
import { SettlementDetailModal } from "@/components/settlement-detail-modal";
import { SettlementHistoryPanel } from "@/components/settlement-history-panel";
import { useDashboard } from "@/context/dashboard-context";
import { usePaystackPayout } from "@/hooks/use-paystack-payout";
import { usePaystackSettlements } from "@/hooks/use-paystack-settlements";
import { isWithdrawalPanelVisible, WithdrawalPanel } from "@/components/withdrawal-panel";
import { usePaystackWithdrawals } from "@/hooks/use-paystack-withdrawals";
import { buildPayoutCardData } from "@/lib/payout-card-data";

export function CreatorPayoutsPage() {
  const { token, tribe, profile } = useDashboard();
  const searchParams = useSearchParams();
  const payoutState = usePaystackPayout(token);
  const settlementsState = usePaystackSettlements(token);
  const withdrawalsState = usePaystackWithdrawals(token);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const cardData = buildPayoutCardData(profile, tribe.username, payoutState.payload);
  const currency =
    payoutState.payload?.payout?.currency ??
    payoutState.payload?.market.currency ??
    profile?.currency ??
    "KES";

  const openSettlement = useCallback((settlementId: string) => {
    setSelectedSettlementId(settlementId);
  }, []);

  const closeSettlement = useCallback(() => {
    setSelectedSettlementId(null);
  }, []);

  const handleRepairComplete = useCallback(() => {
    void payoutState.refresh();
    void settlementsState.refresh();
    void withdrawalsState.refresh();
  }, [payoutState, settlementsState, withdrawalsState]);

  const handleWithdrawComplete = useCallback(() => {
    void payoutState.refresh();
    void settlementsState.refresh();
  }, [payoutState, settlementsState]);

  useEffect(() => {
    const settlementFromQuery = searchParams.get("settlement");
    if (settlementFromQuery) {
      setSelectedSettlementId(settlementFromQuery);
    }
  }, [searchParams]);

  const showWithdrawalPanel = isWithdrawalPanelVisible(withdrawalsState.payload?.status);

  return (
    <>
      <DashboardPageHeader
        title="Payouts"
        description="Track earnings, withdraw to your payout account, and monitor Paystack status."
      />

      <div className="surface-panel rounded-3xl px-3 py-5 sm:px-5 sm:py-6">
        <PayoutCard data={cardData} />
      </div>

      <div className="surface-panel rounded-3xl p-5 sm:p-6">
        <PayoutEarningsSummary
          payload={payoutState.payload}
          profileMetrics={profile?.metrics}
          withdrawalStatus={withdrawalsState.payload?.status}
        />
      </div>

      {showWithdrawalPanel && (
        <div className="surface-panel rounded-3xl p-5 sm:p-6">
          <WithdrawalPanel
            payload={withdrawalsState.payload}
            error={withdrawalsState.error}
            loading={withdrawalsState.loading}
            withdrawing={withdrawalsState.withdrawing}
            onRefresh={() => void withdrawalsState.refresh()}
            onWithdraw={async () => {
              await withdrawalsState.withdraw();
              handleWithdrawComplete();
            }}
          />
        </div>
      )}

      <div className="surface-panel rounded-3xl p-5 sm:p-6">
        <PaystackPayoutStatusPanel
          {...payoutState}
          onRefresh={() => void payoutState.refresh()}
        />
      </div>

      <div className="surface-panel rounded-3xl p-5 sm:p-6">
        <PayoutSyncRepairPanel token={token} onRepaired={handleRepairComplete} />
      </div>

      <div className="surface-panel rounded-3xl p-5 sm:p-6">
        <SettlementHistoryPanel
          settlements={settlementsState.payload?.settlements ?? []}
          currency={currency}
          error={settlementsState.error}
          loading={settlementsState.loading}
          refreshedAt={settlementsState.payload?.refreshed_at}
          syncedAt={settlementsState.payload?.synced_at}
          selectedSettlementId={selectedSettlementId}
          onSelectSettlement={openSettlement}
          onRefresh={() => void settlementsState.refresh()}
        />
      </div>

      <SettlementDetailModal
        token={token}
        settlementId={selectedSettlementId}
        onClose={closeSettlement}
      />
    </>
  );
}

"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PayoutCard } from "@/components/payout-card/payout-card";
import { CreatorEarningsPanel } from "@/components/creator-earnings-panel";
import { PayoutSyncRepairPanel } from "@/components/payout-sync-repair-panel";
import { PaystackPayoutStatusPanel } from "@/components/paystack-payout-status-panel";
import { PayoutCapabilityBanner } from "@/components/payout-capability-banner";
import { SettlementDetailModal } from "@/components/settlement-detail-modal";
import { SettlementHistoryPanel } from "@/components/settlement-history-panel";
import { WithdrawalHistoryPanel } from "@/components/withdrawal-history-panel";
import { useDashboard } from "@/context/dashboard-context";
import { usePaystackPayout } from "@/hooks/use-paystack-payout";
import { usePaystackSettlements } from "@/hooks/use-paystack-settlements";
import { isWithdrawalPanelVisible, WithdrawalPanel } from "@/components/withdrawal-panel";
import { usePaystackWithdrawals } from "@/hooks/use-paystack-withdrawals";
import { buildPayoutCardData } from "@/lib/payout-card-data";
import { buildPayoutCapabilityMessage } from "@/lib/payout-capability";

export function CreatorPayoutsPage() {
  const { token, tribe, profile } = useDashboard();
  const searchParams = useSearchParams();
  const payoutState = usePaystackPayout(token);
  const settlementsState = usePaystackSettlements(token);
  const withdrawalsState = usePaystackWithdrawals(token);
  const settlementFromQuery = searchParams.get("settlement");
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const [ignoredQuerySettlement, setIgnoredQuerySettlement] = useState<string | null>(null);
  const activeSettlementId =
    selectedSettlementId ??
    (settlementFromQuery && settlementFromQuery !== ignoredQuerySettlement
      ? settlementFromQuery
      : null);
  const cardData = buildPayoutCardData(
    profile,
    tribe.username,
    payoutState.payload,
    withdrawalsState.payload?.status,
  );
  const currency =
    payoutState.payload?.payout?.currency ??
    payoutState.payload?.market.currency ??
    profile?.currency ??
    "KES";

  const openSettlement = useCallback((settlementId: string) => {
    setIgnoredQuerySettlement(null);
    setSelectedSettlementId(settlementId);
  }, []);

  const closeSettlement = useCallback(() => {
    if (settlementFromQuery) {
      setIgnoredQuerySettlement(settlementFromQuery);
    }
    setSelectedSettlementId(null);
  }, [settlementFromQuery]);

  const handleRepairComplete = useCallback(() => {
    void payoutState.refresh();
    void settlementsState.refresh();
    void withdrawalsState.refresh();
  }, [payoutState, settlementsState, withdrawalsState]);

  const handleWithdrawComplete = useCallback(() => {
    void payoutState.refresh();
    void settlementsState.refresh();
  }, [payoutState, settlementsState]);

  const showWithdrawalPanel = isWithdrawalPanelVisible(withdrawalsState.payload?.status);
  const capabilityMessage = buildPayoutCapabilityMessage(withdrawalsState.payload?.status);

  return (
    <>
      <DashboardPageHeader
        title="Payouts"
        description="Track earnings, withdraw to your payout account, and monitor Paystack status."
      />

      <div className="surface-panel rounded-3xl px-3 py-5 sm:px-5 sm:py-6">
        <PayoutCard data={cardData} token={token} />
      </div>

      <div className="surface-panel rounded-3xl p-5 sm:p-6">
        <CreatorEarningsPanel
          variant="payouts"
          metrics={profile?.metrics}
          payload={payoutState.payload}
          withdrawalStatus={withdrawalsState.payload?.status}
        />
      </div>

      {capabilityMessage && (
        <div className="surface-panel rounded-3xl p-5 sm:p-6">
          <PayoutCapabilityBanner status={withdrawalsState.payload?.status} />
        </div>
      )}

      {showWithdrawalPanel && (
        <div className="surface-panel rounded-3xl p-5 sm:p-6">
          <WithdrawalPanel
            token={token}
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

      {(withdrawalsState.payload?.withdrawals.length ?? 0) > 0 && (
        <div className="surface-panel rounded-3xl p-5 sm:p-6">
          <WithdrawalHistoryPanel
            token={token}
            withdrawals={withdrawalsState.payload?.withdrawals ?? []}
            currency={currency}
            loading={withdrawalsState.loading}
          />
        </div>
      )}

      <div className="surface-panel rounded-3xl p-5 sm:p-6">
        <PaystackPayoutStatusPanel
          token={token}
          {...payoutState}
          onRefresh={() => void payoutState.refresh()}
        />
      </div>

      <div className="surface-panel rounded-3xl p-5 sm:p-6">
        <PayoutSyncRepairPanel token={token} onRepaired={handleRepairComplete} />
      </div>

      <div className="surface-panel rounded-3xl p-5 sm:p-6">
        <SettlementHistoryPanel
          token={token}
          settlements={settlementsState.payload?.settlements ?? []}
          currency={currency}
          error={settlementsState.error}
          loading={settlementsState.loading}
          refreshedAt={settlementsState.payload?.refreshed_at}
          syncedAt={settlementsState.payload?.synced_at}
          selectedSettlementId={activeSettlementId}
          onSelectSettlement={openSettlement}
          onRefresh={() => void settlementsState.refresh()}
        />
      </div>

      <SettlementDetailModal
        key={activeSettlementId ?? "closed"}
        token={token}
        settlementId={activeSettlementId}
        onClose={closeSettlement}
      />
    </>
  );
}

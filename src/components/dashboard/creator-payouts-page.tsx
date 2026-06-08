"use client";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PayoutCard } from "@/components/payout-card/payout-card";
import { PaystackPayoutStatusPanel } from "@/components/paystack-payout-status-panel";
import { useDashboard } from "@/context/dashboard-context";
import { usePaystackPayout } from "@/hooks/use-paystack-payout";
import { buildPayoutCardData } from "@/lib/payout-card-data";

export function CreatorPayoutsPage() {
  const { token, tribe, profile } = useDashboard();
  const payoutState = usePaystackPayout(token);
  const cardData = buildPayoutCardData(profile, tribe.username, payoutState.payload);

  return (
    <>
      <DashboardPageHeader
        title="Payouts"
        description="Your regional payout card, Paystack verification, and settlement status."
      />

      <div className="rounded-2xl border border-brand-100 bg-white px-3 py-5 shadow-sm sm:px-5 sm:py-6">
        <PayoutCard data={cardData} />
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <PaystackPayoutStatusPanel
          {...payoutState}
          onRefresh={() => void payoutState.refresh()}
        />
      </div>
    </>
  );
}

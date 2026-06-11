"use client";

import { useCallback, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PayoutSyncRepairPanel } from "@/components/payout-sync-repair-panel";
import { TipsList } from "@/components/tips-list";
import { useDashboard } from "@/context/dashboard-context";

export function CreatorTipsPage() {
  const { token } = useDashboard();
  const [tipsRefreshSignal, setTipsRefreshSignal] = useState(0);

  const handleRepairComplete = useCallback(() => {
    setTipsRefreshSignal((current) => current + 1);
  }, []);

  return (
    <>
      <DashboardPageHeader
        title="Tips & earnings"
        description="Recent supporter payments and their status."
      />

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <PayoutSyncRepairPanel token={token} onRepaired={handleRepairComplete} />
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <TipsList token={token} refreshSignal={tipsRefreshSignal} />
      </div>
    </>
  );
}

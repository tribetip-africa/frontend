"use client";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { TipsList } from "@/components/tips-list";
import { useDashboard } from "@/context/dashboard-context";

export function CreatorTipsPage() {
  const { token } = useDashboard();

  return (
    <>
      <DashboardPageHeader
        title="Tips & earnings"
        description="Recent supporter payments and their status."
      />

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <TipsList token={token} />
      </div>
    </>
  );
}

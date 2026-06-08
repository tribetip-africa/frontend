"use client";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { AdminAccountsPanel } from "@/components/dashboard/admin-accounts-panel";
import { AdminWebhookEventsPanel } from "@/components/dashboard/admin-webhook-events-panel";
import { AdminTipInvestigationPanel } from "@/components/dashboard/admin-tip-investigation-panel";
import { useDashboard } from "@/context/dashboard-context";

export function AdminAccountsPage() {
  const { token } = useDashboard();

  return (
    <>
      <DashboardPageHeader
        title="Creator accounts"
        description="Search creators, review tip activity, suspend or activate accounts, and inspect Paystack onboarding."
      />

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <AdminAccountsPanel token={token} />
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <AdminWebhookEventsPanel token={token} />
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <AdminTipInvestigationPanel token={token} />
      </div>
    </>
  );
}

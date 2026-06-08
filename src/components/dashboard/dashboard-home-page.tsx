"use client";

import { AdminOverviewPage, CreatorOverviewPage } from "@/components/dashboard/creator-overview-page";
import { useDashboard } from "@/context/dashboard-context";

export function DashboardHomePage() {
  const { isAdmin } = useDashboard();

  if (isAdmin) {
    return <AdminOverviewPage />;
  }

  return <CreatorOverviewPage />;
}

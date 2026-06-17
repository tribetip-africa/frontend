"use client";

import { CreatorNotificationsPage } from "@/components/dashboard/creator-notifications-page";
import { useDashboard } from "@/context/dashboard-context";

export default function NotificationsPage() {
  const { token } = useDashboard();

  return <CreatorNotificationsPage token={token} />;
}

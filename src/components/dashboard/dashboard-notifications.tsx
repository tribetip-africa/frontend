"use client";

import { NotificationCenter } from "@/components/notification-center";
import { NotificationToast } from "@/components/notification-toast";
import { useNotifications } from "@/hooks/use-notifications";

type DashboardNotificationsProps = {
  token: string;
  enabled: boolean;
};

export function DashboardNotifications({ token, enabled }: DashboardNotificationsProps) {
  const state = useNotifications(token, enabled);

  return (
    <>
      <NotificationCenter
        notifications={state.notifications}
        unreadCount={state.unreadCount}
        loading={state.loading}
        onMarkRead={(id) => void state.markRead(id)}
        onMarkAllRead={() => void state.markAllRead()}
      />
      <NotificationToast notification={state.toastNotification} onDismiss={state.dismissToast} />
    </>
  );
}

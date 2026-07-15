"use client";

import Link from "next/link";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { formatSettlementDate } from "@/lib/settlement-status";
import { settlementNotificationHref } from "@/lib/notification-links";
import type { CreatorNotification } from "@/types/api";

type CreatorNotificationsPageProps = {
  token: string | null;
};

function settlementHref(notification: CreatorNotification): string {
  return settlementNotificationHref(notification);
}

export function CreatorNotificationsPage({ token }: CreatorNotificationsPageProps) {
  const state = useNotifications(token, true, { limit: 50, poll: false });

  return (
    <>
      <DashboardPageHeader
        title="Notifications"
        description="Settlement updates and payout activity from TribeTip."
        action={
          state.unreadCount > 0 ? (
            <Button type="button" variant="secondary" onClick={() => void state.markAllRead()}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        {state.loading && state.notifications.length === 0 ? (
          <p className="text-sm text-brand-700">Loading notifications…</p>
        ) : state.notifications.length === 0 ? (
          <p className="text-sm text-brand-700">
            No notifications yet. You will see payout updates here when settlements complete.
          </p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {state.notifications.map((notification) => (
              <li
                key={notification.id}
                className={`flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between ${
                  notification.read_at ? "" : "bg-brand-50/40 -mx-2 rounded-2xl px-2"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-brand-900">{notification.title}</p>
                  <p className="mt-1 text-sm text-brand-700">{notification.body}</p>
                  <p className="mt-2 text-xs text-brand-500">
                    {formatSettlementDate(notification.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link href={settlementHref(notification)}>
                    <Button type="button" variant="ghost">
                      View settlement
                    </Button>
                  </Link>
                  {!notification.read_at && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void state.markRead(notification.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

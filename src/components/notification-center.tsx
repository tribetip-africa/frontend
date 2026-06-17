"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatSettlementDate } from "@/lib/settlement-status";
import { settlementNotificationHref } from "@/lib/notification-links";
import type { CreatorNotification } from "@/types/api";
import { Button } from "@/components/ui/button";

type NotificationCenterProps = {
  notifications: CreatorNotification[];
  unreadCount: number;
  loading: boolean;
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead: () => void;
};

function settlementHref(notification: CreatorNotification): string {
  return settlementNotificationHref(notification);
}

export function NotificationCenter({
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onMarkAllRead,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className="relative rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm font-medium text-brand-800 hover:bg-brand-50"
        onClick={() => setOpen((current) => !current)}
      >
        Notifications
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-brand-100 bg-white shadow-xl shadow-brand-900/10">
          <div className="flex items-center justify-between border-b border-brand-100 px-4 py-3">
            <div>
              <p className="font-semibold text-brand-900">Notifications</p>
              <p className="text-xs text-brand-600">
                {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button type="button" variant="ghost" onClick={() => void onMarkAllRead()}>
                Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-brand-700">Loading notifications…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-brand-700">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-brand-50 px-4 py-3 last:border-b-0 ${
                    notification.read_at ? "bg-white" : "bg-brand-50/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-brand-900">{notification.title}</p>
                      <p className="mt-1 text-sm text-brand-700">{notification.body}</p>
                      <p className="mt-2 text-xs text-brand-500">
                        {formatSettlementDate(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read_at && (
                      <button
                        type="button"
                        className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-800"
                        onClick={() => void onMarkRead(notification.id)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <Link
                    href={settlementHref(notification)}
                    className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-800"
                    onClick={() => {
                      if (!notification.read_at) {
                        void onMarkRead(notification.id);
                      }
                      setOpen(false);
                    }}
                  >
                    View settlement
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-brand-100 px-4 py-3">
            <Link
              href="/dashboard/notifications"
              className="text-sm font-medium text-brand-600 hover:text-brand-800"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

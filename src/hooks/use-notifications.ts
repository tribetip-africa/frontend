"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchCreatorNotifications,
  markAllCreatorNotificationsRead,
  markCreatorNotificationRead,
} from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import {
  hasSeenNotificationToast,
  markNotificationToastSeen,
} from "@/lib/notification-storage";
import { runAfterPaint } from "@/lib/run-after-paint";
import type { CreatorNotification } from "@/types/api";

const POLL_INTERVAL_MS = 45_000;

export function useNotifications(token: string, enabled: boolean) {
  const [notifications, setNotifications] = useState<CreatorNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotification, setToastNotification] = useState<CreatorNotification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const knownIdsRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const payload = await fetchCreatorNotifications(token, { limit: 20 });
      setNotifications(payload.notifications);
      setUnreadCount(payload.unread_count);

      const freshUnread = payload.notifications.filter(
        (notification) => !notification.read_at && !knownIdsRef.current.has(notification.id),
      );

      for (const notification of freshUnread) {
        knownIdsRef.current.add(notification.id);
      }

      const toastCandidate = freshUnread.find(
        (notification) => !hasSeenNotificationToast(notification.id),
      );

      if (toastCandidate) {
        setToastNotification(toastCandidate);
        markNotificationToastSeen(toastCandidate.id);
      }
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [enabled, token]);

  useEffect(() => {
    if (!enabled) return;
    runAfterPaint(() => refresh());
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled) return;

    const timer = window.setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [enabled, refresh]);

  const markRead = useCallback(
    async (notificationId: string) => {
      await markCreatorNotificationRead(token, notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date().toISOString() }
            : notification,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    },
    [token],
  );

  const markAllRead = useCallback(async () => {
    await markAllCreatorNotificationsRead(token);
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read_at: notification.read_at ?? new Date().toISOString(),
      })),
    );
    setUnreadCount(0);
  }, [token]);

  const dismissToast = useCallback(() => {
    setToastNotification(null);
  }, []);

  return {
    notifications,
    unreadCount,
    toastNotification,
    error,
    loading,
    refresh,
    markRead,
    markAllRead,
    dismissToast,
  };
}

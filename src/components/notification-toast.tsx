"use client";

import Link from "next/link";
import type { CreatorNotification } from "@/types/api";

type NotificationToastProps = {
  notification: CreatorNotification | null;
  onDismiss: () => void;
};

function settlementHref(notification: CreatorNotification): string {
  const transferCode = notification.metadata.paystack_transfer_code;
  if (typeof transferCode === "string" && transferCode.length > 0) {
    return `/dashboard/payouts?settlement=${encodeURIComponent(transferCode)}`;
  }

  return "/dashboard/payouts";
}

export function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  if (!notification) return null;

  const isSuccess = notification.kind === "settlement_paid";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex max-w-md items-start gap-4 rounded-2xl border bg-white p-4 shadow-xl shadow-brand-900/10 sm:items-center sm:p-5 ${
          isSuccess ? "border-green-200" : "border-amber-200"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            isSuccess ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"
          }`}
        >
          {isSuccess ? "✓" : "!"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-brand-900">{notification.title}</p>
          <p className="mt-1 text-sm text-brand-700">{notification.body}</p>
          <Link
            href={settlementHref(notification)}
            className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-800"
            onClick={onDismiss}
          >
            View settlement
          </Link>
        </div>
        <button
          type="button"
          className="pointer-events-auto shrink-0 text-sm font-medium text-brand-600 hover:text-brand-800"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

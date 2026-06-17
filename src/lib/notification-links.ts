import type { CreatorNotification } from "@/types/api";

export function settlementNotificationHref(notification: CreatorNotification): string {
  const transferCode = notification.metadata.paystack_transfer_code;
  if (typeof transferCode === "string" && transferCode.length > 0) {
    return `/dashboard/payouts?settlement=${encodeURIComponent(transferCode)}`;
  }

  return "/dashboard/payouts";
}

import type { Tip, TipPaidVia, TipStatus } from "@/types/api";

export function formatTipStatus(status: TipStatus): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
  }
}

export function formatTipPaidVia(paidVia?: TipPaidVia | null): string | null {
  switch (paidVia) {
    case "webhook":
      return "Confirmed by Paystack webhook";
    case "reconcile":
      return "Confirmed after checkout return";
    case "sweep":
      return "Confirmed by background recovery";
    default:
      return null;
  }
}

export function tipSupporterLabel(tip: Pick<Tip, "supporter_name" | "supporter_email">): string {
  return tip.supporter_name?.trim() || tip.supporter_email?.trim() || "Supporter";
}

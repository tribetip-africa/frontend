import type { PaystackSettlement } from "@/types/api";

const SOURCE_LABELS: Record<string, string> = {
  sync: "Synced",
  webhook: "Webhook",
  manual_withdrawal: "Manual withdrawal",
};

export function settlementSourceLabel(
  source: PaystackSettlement["source"] | undefined,
): string {
  if (!source) return "Unknown";
  return SOURCE_LABELS[source] ?? source.replaceAll("_", " ");
}

export function settlementSourceTone(
  source: PaystackSettlement["source"] | undefined,
): string {
  if (source === "manual_withdrawal") {
    return "bg-blue-50 text-blue-800 ring-blue-200";
  }

  if (source === "webhook") {
    return "bg-green-50 text-green-800 ring-green-200";
  }

  return "bg-brand-50 text-brand-700 ring-brand-200";
}

import type { PaystackSettlement } from "@/types/api";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  success: "Settled",
  failed: "Failed",
  reversed: "Reversed",
};

const STATUS_TONES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  processing: "bg-blue-50 text-blue-800 ring-blue-200",
  success: "bg-green-50 text-green-800 ring-green-200",
  failed: "bg-red-50 text-red-800 ring-red-200",
  reversed: "bg-brand-50 text-brand-700 ring-brand-200",
};

export function settlementStatusLabel(status: PaystackSettlement["status"]): string {
  return STATUS_LABELS[status] ?? "Processing";
}

export function settlementStatusTone(status: PaystackSettlement["status"]): string {
  return STATUS_TONES[status] ?? STATUS_TONES.processing!;
}

export function formatSettlementDate(value?: string): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

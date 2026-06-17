import type { Tip } from "@/types/api";

export function formatTipDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function tipStatusLabel(status: Tip["status"]): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
  }
}

export function tipStatusTone(status: Tip["status"]): string {
  if (status === "paid") return "bg-green-50 text-green-800";
  if (status === "pending") return "bg-amber-50 text-amber-900";
  return "bg-red-50 text-red-800";
}

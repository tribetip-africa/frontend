import { tipSupporterLabel } from "@/lib/tip-detail";
import type { Tip } from "@/types/api";

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function buildSupporterExportRows(tips: Tip[]): string[][] {
  return tips.map((tip) => [
    tipSupporterLabel(tip),
    tip.supporter_email ?? "",
    tip.status,
    String(tip.amount_cents / 100),
    tip.currency,
    tip.message ?? "",
    tip.paid_at ?? "",
    tip.created_at,
    tip.paystack_reference,
  ]);
}

export function buildSupporterExportCsv(tips: Tip[]): string {
  const header = [
    "Supporter",
    "Email",
    "Status",
    "Amount",
    "Currency",
    "Message",
    "Paid at",
    "Created at",
    "Paystack reference",
  ];

  const rows = buildSupporterExportRows(tips).map((row) => row.map((cell) => csvCell(cell)).join(","));
  return [header.map((cell) => csvCell(cell)).join(","), ...rows].join("\n");
}

export function downloadCsvFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

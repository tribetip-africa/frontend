import { formatMoney } from "@/lib/money";
import type { PaystackRepairResult } from "@/types/api";

export type RepairSummaryLine = {
  label: string;
  value: string;
};

export function buildRepairSummaryLines(result: PaystackRepairResult): RepairSummaryLine[] {
  const currency =
    result.payout?.currency ??
    result.earnings?.currency ??
    result.settlement_summary?.currency ??
    "KES";
  const lines: RepairSummaryLine[] = [
    {
      label: "Settlements checked",
      value: String(result.settlements_count),
    },
    {
      label: "Pending tips updated",
      value: `${result.tips_reconciled} of ${result.tips_examined}${
        result.tips_still_pending > 0 ? ` · ${result.tips_still_pending} still pending` : ""
      }`,
    },
  ];

  if (result.settlement_summary) {
    lines.push({
      label: "Total settled",
      value: formatMoney(result.settlement_summary.total_settled_cents, currency),
    });

    if (result.settlement_summary.failed_settlements_count > 0) {
      lines.push({
        label: "Failed settlements",
        value: String(result.settlement_summary.failed_settlements_count),
      });
    }
  }

  if (result.earnings) {
    lines.push({
      label: "Total earned",
      value: formatMoney(result.earnings.total_earned_cents, currency),
    });
    lines.push({
      label: "Pending tips",
      value: `${result.earnings.pending_tips_count} · ${formatMoney(
        result.earnings.pending_tips_cents,
        currency,
      )}`,
    });
  }

  const availableCents =
    result.payout?.available_to_settle_cents ?? result.payout?.pending_settlement_cents;
  if (typeof availableCents === "number") {
    lines.push({
      label: "Available balance",
      value: formatMoney(availableCents, currency),
    });
  }

  return lines;
}

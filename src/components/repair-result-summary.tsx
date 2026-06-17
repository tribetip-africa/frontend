import type { PaystackRepairResult } from "@/types/api";
import { buildRepairSummaryLines } from "@/lib/repair-result-summary";
import { formatSettlementDate } from "@/lib/settlement-status";

type RepairResultSummaryProps = {
  result: PaystackRepairResult;
};

export function RepairResultSummary({ result }: RepairResultSummaryProps) {
  const lines = buildRepairSummaryLines(result);

  return (
    <div className="rounded-2xl border border-green-100 bg-green-50/60 px-4 py-3 text-sm text-brand-800">
      <p className="font-medium text-brand-900">Sync complete</p>
      <ul className="mt-2 space-y-1">
        {lines.map((line) => (
          <li key={line.label}>
            <span className="font-medium text-brand-900">{line.label}:</span> {line.value}
          </li>
        ))}
      </ul>
      {result.refreshed_at && (
        <p className="mt-3 text-xs text-brand-600">
          Balances refreshed {formatSettlementDate(result.refreshed_at)}
        </p>
      )}
    </div>
  );
}

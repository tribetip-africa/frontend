import type { PaystackVerificationCheck } from "@/types/api";

type PaystackVerificationChecksProps = {
  checks: PaystackVerificationCheck[];
};

function statusIcon(status: PaystackVerificationCheck["status"]): string {
  switch (status) {
    case "ok":
      return "✓";
    case "skipped":
      return "–";
    case "missing":
    case "failed":
      return "✗";
    default:
      return "…";
  }
}

function statusClass(status: PaystackVerificationCheck["status"]): string {
  switch (status) {
    case "ok":
      return "text-green-800";
    case "skipped":
      return "text-brand-600";
    case "missing":
    case "failed":
      return "text-red-700";
    default:
      return "text-brand-700";
  }
}

function formatCheckName(name: string): string {
  return name.replaceAll("_", " ");
}

export function PaystackVerificationChecks({ checks }: PaystackVerificationChecksProps) {
  if (checks.length === 0) return null;

  return (
    <ul className="mt-3 space-y-2 text-sm text-brand-800">
      {checks.map((check) => (
        <li key={check.name} className="flex gap-2">
          <span className={`shrink-0 font-medium ${statusClass(check.status)}`}>
            {statusIcon(check.status)}
          </span>
          <span>
            <span className="font-medium capitalize">{formatCheckName(check.name)}</span>
            {check.message ? (
              <span className="text-brand-600"> — {check.message}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

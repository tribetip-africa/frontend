import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { RevealablePayoutDestination } from "@/components/revealable-payout-destination";
import {
  formatSettlementDate,
  settlementStatusLabel,
  settlementStatusTone,
} from "@/lib/settlement-status";
import {
  buildSettlementHealth,
  pickLatestSettlement,
} from "@/lib/creator-settlement-snapshot";
import type { PaystackSettlementsPayload } from "@/types/api";
import { Button } from "@/components/ui/button";

type CreatorLastSettlementProps = {
  token?: string;
  payload: PaystackSettlementsPayload | null;
  loading: boolean;
  error: string | null;
};

export function CreatorLastSettlement({ token, payload, loading, error }: CreatorLastSettlementProps) {
  const latestSettlement = pickLatestSettlement(payload?.settlements ?? []);
  const health = buildSettlementHealth(payload?.summary, latestSettlement);
  const settlementHref = health.lastSettlementId
    ? `/dashboard/payouts?settlement=${encodeURIComponent(health.lastSettlementId)}`
    : "/dashboard/payouts";

  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-brand-900">Latest payout</h2>
          <p className="mt-1 text-sm text-brand-700">
            Your most recent settlement from Paystack to your linked account.
          </p>
        </div>
        <Link href="/dashboard/payouts">
          <Button variant="ghost" type="button">
            View payouts
          </Button>
        </Link>
      </div>

      {loading && !latestSettlement && (
        <p className="mt-4 text-sm text-brand-700">Loading settlement activity…</p>
      )}

      {error && !latestSettlement && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!loading && !latestSettlement && !error && (
        <p className="mt-4 text-sm text-brand-700">
          No settlements yet. Once Paystack pays out your share, the latest event will appear here.
        </p>
      )}

      {latestSettlement && (
        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/50 px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold text-brand-900">
                {formatMoney(latestSettlement.amount_cents, latestSettlement.currency)}
              </p>
              <p className="mt-1 text-sm text-brand-700">
                {formatSettlementDate(health.lastSettledAt ?? latestSettlement.settled_at)}
              </p>
              {latestSettlement.destination && (
                <p className="mt-1 text-sm text-brand-600">
                  To{" "}
                  <RevealablePayoutDestination
                    destination={latestSettlement.destination}
                    token={token}
                  />
                </p>
              )}
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${settlementStatusTone(latestSettlement.status)}`}
            >
              {settlementStatusLabel(latestSettlement.status)}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-brand-600">
            <span>{health.successfulSettlementsCount} successful payouts</span>
            {health.failedSettlementsCount > 0 && (
              <span className="text-red-700">
                {health.failedSettlementsCount} failed payout
                {health.failedSettlementsCount === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <Link href={settlementHref} className="mt-4 inline-block">
            <Button variant="secondary" type="button">
              View settlement details
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { countStalePendingTips } from "@/lib/creator-onboarding-progress";
import { PaystackSyncButton } from "@/components/paystack-sync-button";
import type { CreatorMetrics, Tip } from "@/types/api";
import { Button } from "@/components/ui/button";

type CreatorNeedsAttentionProps = {
  token: string | null;
  metrics: CreatorMetrics | null | undefined;
  tips: Tip[];
  onRepaired?: () => void;
};

type AttentionItem = {
  id: string;
  tone: "warning" | "danger";
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
};

export function CreatorNeedsAttention({
  token,
  metrics,
  tips,
  onRepaired,
}: CreatorNeedsAttentionProps) {
  const [syncError, setSyncError] = useState<string | null>(null);

  const pendingCount = metrics?.pending_tips_count ?? 0;
  const failedCount = metrics?.failed_tips_count ?? 0;
  const stalePendingCount = countStalePendingTips(tips);
  const items: AttentionItem[] = [];

  if (stalePendingCount > 0) {
    items.push({
      id: "stale-pending",
      tone: "warning",
      title: `${stalePendingCount} pending tip${stalePendingCount === 1 ? "" : "s"} need a check`,
      body: "These tips have been pending for more than 15 minutes. Sync with Paystack or review them on the tips page.",
      actionLabel: "Review tips",
      actionHref: "/dashboard/tips",
    });
  } else if (pendingCount > 0) {
    items.push({
      id: "pending",
      tone: "warning",
      title: `${pendingCount} tip${pendingCount === 1 ? "" : "s"} awaiting payment`,
      body: "Payments usually confirm within a few minutes. You can check status on your tips page.",
      actionLabel: "View tips",
      actionHref: "/dashboard/tips",
    });
  }

  if (failedCount > 0) {
    items.push({
      id: "failed",
      tone: "danger",
      title: `${failedCount} failed checkout${failedCount === 1 ? "" : "s"}`,
      body: "A supporter may have abandoned payment or the checkout did not complete.",
      actionLabel: "View tips",
      actionHref: "/dashboard/tips",
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-brand-900">Needs attention</h2>
          <p className="mt-1 text-sm text-brand-700">
            Quick actions for tips that may need a follow-up.
          </p>
        </div>
        <PaystackSyncButton
          token={token}
          onRepaired={() => onRepaired?.()}
          onError={setSyncError}
        />
      </div>

      {syncError && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {syncError}
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className={`rounded-2xl border px-4 py-3 ${
              item.tone === "danger"
                ? "border-red-200 bg-white text-red-900"
                : "border-amber-200 bg-white text-amber-950"
            }`}
          >
            <p className="font-medium">{item.title}</p>
            <p className="mt-1 text-sm opacity-90">{item.body}</p>
            {item.actionHref && item.actionLabel && (
              <Link href={item.actionHref} className="mt-3 inline-block">
                <Button type="button" variant="ghost">
                  {item.actionLabel}
                </Button>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

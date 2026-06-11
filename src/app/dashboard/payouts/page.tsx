import { Suspense } from "react";
import { CreatorPayoutsPage } from "@/components/dashboard/creator-payouts-page";

export default function DashboardPayoutsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-brand-700">Loading payouts…</p>}>
      <CreatorPayoutsPage />
    </Suspense>
  );
}

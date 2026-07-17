"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardHero, StatusBadge } from "@/components/dashboard/dashboard-hero";
import { CreatorEarningsPanel } from "@/components/creator-earnings-panel";
import { CreatorLastSettlement } from "@/components/dashboard/creator-last-settlement";
import { CreatorNeedsAttention } from "@/components/dashboard/creator-needs-attention";
import { CreatorOnboardingStepper } from "@/components/dashboard/creator-onboarding-stepper";
import { CreatorPrimaryCtaCard } from "@/components/dashboard/creator-primary-cta";
import { CreatorSharePromo } from "@/components/dashboard/creator-share-promo";
import { PayoutCard } from "@/components/payout-card/payout-card";
import { PublicPageActions } from "@/components/public-page-actions";
import { TipsList } from "@/components/tips-list";
import { Button } from "@/components/ui/button";
import { useCreatorTipsPreview } from "@/hooks/use-creator-tips-preview";
import { usePaystackPayout } from "@/hooks/use-paystack-payout";
import { usePaystackSettlements } from "@/hooks/use-paystack-settlements";
import { usePaystackWithdrawals } from "@/hooks/use-paystack-withdrawals";
import {
  buildCreatorOnboardingSteps,
  buildCreatorPrimaryCta,
  isCreatorFullyLive,
} from "@/lib/creator-onboarding-progress";
import { accountStatusBannerForCreator } from "@/lib/paystack-onboarding";
import { canAccessCreatorPublicPage, isPublicPageShareable } from "@/lib/creator-public-page";
import { buildPayoutCardData } from "@/lib/payout-card-data";
import { fetchAdminTribes, fetchMyProfile } from "@/lib/api";
import { AdminMetricsPanel } from "@/components/admin-metrics-panel";
import { AdminReferralsPanel } from "@/components/dashboard/admin-referrals-panel";
import { AdminEarlyAccessPanel } from "@/components/dashboard/admin-early-access-panel";
import { useDashboard } from "@/context/dashboard-context";
import type { AdminOverview } from "@/types/api";

function accountStatusTone(
  status: "active" | "pending" | "suspended",
): "success" | "warning" | "danger" | "neutral" {
  if (status === "active") return "success";
  if (status === "suspended") return "danger";
  return "warning";
}

export function CreatorOverviewPage() {
  const { token, tribe, profile, profileError, onProfileChange } = useDashboard();
  const payoutState = usePaystackPayout(token);
  const settlementsState = usePaystackSettlements(token, { refresh: false });
  const withdrawalsState = usePaystackWithdrawals(token);
  const [tipsRefreshSignal, setTipsRefreshSignal] = useState(0);
  const { tips, loading: tipsLoading, error: tipsError } = useCreatorTipsPreview(
    token,
    tipsRefreshSignal,
  );
  const shareable = canAccessCreatorPublicPage(tribe, profile);
  const statusBanner = accountStatusBannerForCreator(tribe, profile);
  const accountStatus = profile?.account_status ?? tribe.account_status;
  const onboardingSteps = buildCreatorOnboardingSteps({ tribe, profile });
  const primaryCta = buildCreatorPrimaryCta({ tribe, profile });
  const fullyLive = isCreatorFullyLive({ tribe, profile });
  const currency = profile?.currency ?? withdrawalsState.payload?.status.currency ?? "KES";
  const availableToWithdrawCents = withdrawalsState.payload?.status.available_to_withdraw_cents;
  const cardData = buildPayoutCardData(
    profile,
    tribe.username,
    payoutState.payload,
    withdrawalsState.payload?.status,
  );

  async function handleRepairComplete() {
    setTipsRefreshSignal((current) => current + 1);
    void payoutState.refresh();

    try {
      onProfileChange(await fetchMyProfile(token));
    } catch {
      // Profile refresh is best-effort after sync.
    }
  }

  return (
    <>
      <DashboardHero
        eyebrow="Creator workspace"
        title={`Welcome back, @${tribe.username}`}
        description="Earnings, recent tips, payouts, and your public page in one place."
        badges={
          <>
            <StatusBadge tone={accountStatusTone(accountStatus)}>{accountStatus}</StatusBadge>
            {profile && (
              <StatusBadge tone={profile.is_profile_public ? "success" : "warning"}>
                {profile.is_profile_public ? "Page live" : "Page draft"}
              </StatusBadge>
            )}
            {profile && isPublicPageShareable(profile) && (
              <StatusBadge tone="success">Link unlocked</StatusBadge>
            )}
          </>
        }
        actions={<PublicPageActions username={tribe.username} shareable={shareable} />}
      />

      {!fullyLive && (
        <>
          <CreatorOnboardingStepper steps={onboardingSteps} />
          {primaryCta && <CreatorPrimaryCtaCard cta={primaryCta} />}
        </>
      )}

      <div className="surface-panel rounded-3xl px-3 py-5 sm:px-5 sm:py-6">
        <PayoutCard data={cardData} token={token} />
      </div>

      <CreatorNeedsAttention
        token={token}
        metrics={profile?.metrics}
        tips={tips}
        onRepaired={() => void handleRepairComplete()}
      />

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <CreatorEarningsPanel
          variant="overview"
          metrics={profile?.metrics}
          availableToWithdrawCents={availableToWithdrawCents}
          totalSettledCents={settlementsState.payload?.summary?.total_settled_cents}
          currencyFallback={currency}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-6">
        <TipsList
          token={token}
          refreshSignal={tipsRefreshSignal}
          previewLimit={5}
          tips={tips}
          loading={tipsLoading}
          error={tipsError}
        />
        <CreatorSharePromo username={tribe.username} profile={profile} shareable={shareable} />
      </div>

      <CreatorLastSettlement
        token={token}
        payload={settlementsState.payload}
        loading={settlementsState.loading}
        error={settlementsState.error}
      />

      {statusBanner && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            statusBanner.tone === "danger"
              ? "border-red-200 bg-red-50 text-red-800"
              : statusBanner.tone === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-brand-200 bg-accent-soft text-brand-800"
          }`}
          role="status"
        >
          {statusBanner.message}
        </div>
      )}

      {profileError && (
        <p
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {profileError}
        </p>
      )}
    </>
  );
}

export function AdminOverviewPage() {
  const { token, tribe } = useDashboard();
  const [overview, setOverview] = useState<AdminOverview | null>(null);

  useEffect(() => {
    fetchAdminTribes(token)
      .then((payload) => setOverview(payload.overview))
      .catch(() => setOverview(null));
  }, [token]);

  return (
    <>
      <DashboardHero
        eyebrow="Platform admin"
        title="Overview"
        description="High-level counts for accounts, tips, and payout readiness across all markets."
        badges={
          <>
            <StatusBadge tone="neutral">@{tribe.username}</StatusBadge>
            {overview && (
              <StatusBadge tone="success">{overview.active_tribes} active accounts</StatusBadge>
            )}
          </>
        }
        actions={
          <Link href="/">
            <Button variant="secondary" type="button">
              View site
            </Button>
          </Link>
        }
      />

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        {overview ? (
          <AdminMetricsPanel overview={overview} embedded />
        ) : (
          <p className="text-sm text-brand-700">Loading platform metrics…</p>
        )}
      </div>

      <AdminEarlyAccessPanel token={token} />
      <AdminReferralsPanel token={token} />
    </>
  );
}

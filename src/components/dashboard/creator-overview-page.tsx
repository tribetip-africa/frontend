"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardHero, StatusBadge } from "@/components/dashboard/dashboard-hero";
import { CreatorMetricsPanel } from "@/components/creator-metrics-panel";
import { PayoutCard } from "@/components/payout-card/payout-card";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/dashboard-context";
import { buildPayoutCardData } from "@/lib/payout-card-data";
import { accountStatusBannerForCreator } from "@/lib/paystack-onboarding";
import { canAccessCreatorPublicPage, isPublicPageShareable } from "@/lib/creator-public-page";
import { getCreatorPageUrl } from "@/lib/platform";
import { fetchAdminTribes } from "@/lib/api";
import { AdminMetricsPanel } from "@/components/admin-metrics-panel";
import type { AdminOverview } from "@/types/api";

const LOCKED_PAGE_HINT =
  "Publish your page and complete payout verification to unlock your public tip link.";

function accountStatusTone(
  status: "active" | "pending" | "suspended",
): "success" | "warning" | "danger" | "neutral" {
  if (status === "active") return "success";
  if (status === "suspended") return "danger";
  return "warning";
}

export function CreatorOverviewPage() {
  const { tribe, profile, profileError } = useDashboard();
  const [copied, setCopied] = useState(false);
  const shareable = canAccessCreatorPublicPage(tribe, profile);
  const publicPageUrl = getCreatorPageUrl(tribe.username);
  const statusBanner = accountStatusBannerForCreator(tribe, profile);
  const cardData = buildPayoutCardData(profile, tribe.username, null);
  const accountStatus = profile?.account_status ?? tribe.account_status;

  async function copyPublicLink() {
    if (!shareable) return;

    try {
      await navigator.clipboard.writeText(publicPageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="order-1 lg:order-2">
        <div className="mb-4 space-y-3 lg:hidden">
          <p className="text-center text-sm font-medium text-brand-700">
            Welcome back, @{tribe.username}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <StatusBadge tone={accountStatusTone(accountStatus)}>
              {accountStatus}
            </StatusBadge>
            {profile && (
              <StatusBadge tone={profile.is_profile_public ? "success" : "warning"}>
                {profile.is_profile_public ? "Page live" : "Page draft"}
              </StatusBadge>
            )}
            {profile && isPublicPageShareable(profile) && (
              <StatusBadge tone="success">Link unlocked</StatusBadge>
            )}
          </div>
        </div>
        <div className="mx-auto w-full max-w-full px-1 sm:max-w-[520px] lg:px-0">
          <PayoutCard data={cardData} />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2 lg:hidden">
          {shareable ? (
            <a href={publicPageUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" type="button">
                View public page
              </Button>
            </a>
          ) : (
            <Button variant="secondary" type="button" disabled title={LOCKED_PAGE_HINT}>
              View public page
            </Button>
          )}
          <Button
            variant="ghost"
            type="button"
            disabled={!shareable}
            title={shareable ? undefined : LOCKED_PAGE_HINT}
            onClick={() => void copyPublicLink()}
          >
            {copied ? "Link copied" : "Copy page link"}
          </Button>
        </div>
      </div>

      <div className="order-2 hidden lg:order-1 lg:block">
        <DashboardHero
          eyebrow="Creator workspace"
          title={`Welcome back, @${tribe.username}`}
          description="Your earnings snapshot and page readiness at a glance."
          badges={
            <>
              <StatusBadge tone={accountStatusTone(accountStatus)}>
                {accountStatus}
              </StatusBadge>
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
          actions={
            <>
              {shareable ? (
                <a href={publicPageUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" type="button">
                    View public page
                  </Button>
                </a>
              ) : (
                <Button variant="secondary" type="button" disabled title={LOCKED_PAGE_HINT}>
                  View public page
                </Button>
              )}
              <Button
                variant="ghost"
                type="button"
                disabled={!shareable}
                title={shareable ? undefined : LOCKED_PAGE_HINT}
                onClick={() => void copyPublicLink()}
              >
                {copied ? "Link copied" : "Copy page link"}
              </Button>
            </>
          }
        />
      </div>

      {statusBanner && (
        <div
          className={`order-3 rounded-2xl border px-4 py-3 text-sm ${
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
          className="order-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {profileError}
        </p>
      )}

      <div className="order-5 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        {profile && !shareable && (
          <div className="mb-5 flex justify-end">
            <Link href="/dashboard/public-page">
              <Button variant="secondary" type="button">
                Finish public page
              </Button>
            </Link>
          </div>
        )}

        {profile?.metrics ? (
          <CreatorMetricsPanel
            metrics={profile.metrics}
            isProfilePublic={profile.is_profile_public}
            embedded
          />
        ) : (
          <p className="text-sm text-brand-700">Complete payout setup to unlock your metrics.</p>
        )}
      </div>
    </div>
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
    </>
  );
}

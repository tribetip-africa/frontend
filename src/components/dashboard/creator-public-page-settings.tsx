"use client";

import Link from "next/link";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { ProfileSettings } from "@/components/profile-settings";
import { PublicPageUrlField } from "@/components/public-page-url-field";
import { ShareQrPanel } from "@/components/share-qr-panel";
import { PublicPageActions } from "@/components/public-page-actions";
import { useDashboard } from "@/context/dashboard-context";
import { canAccessCreatorPublicPage } from "@/lib/creator-public-page";

export function CreatorPublicPageSettings() {
  const { tribe, token, profile, onProfileChange } = useDashboard();
  const shareable = canAccessCreatorPublicPage(tribe, profile);

  return (
    <>
      <DashboardPageHeader
        title="Public page"
        description="How supporters find you and what they see on your tip page."
        action={
          <PublicPageActions
            username={tribe.username}
            shareable={shareable}
            viewLabel="Open live page"
          />
        }
      />

      <div className="space-y-5 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <PublicPageUrlField username={tribe.username} profile={profile} shareable={shareable} />
        <ShareQrPanel
          token={token}
          shareable={shareable}
          displayName={profile?.display_name ?? tribe.username}
        />

        <p className="text-sm text-brand-700">
          Want a mini tip card on your own website?{" "}
          <Link href="/dashboard/widget" className="font-medium text-brand-700 underline">
            Set up the website widget
          </Link>
          .
        </p>

        {profile ? (
          <ProfileSettings
            token={token}
            initialProfile={profile}
            onProfileChange={onProfileChange}
            embedded
          />
        ) : (
          <p className="text-sm text-brand-700">Loading profile settings…</p>
        )}
      </div>
    </>
  );
}

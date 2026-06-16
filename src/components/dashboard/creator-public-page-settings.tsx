"use client";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { ProfileSettings } from "@/components/profile-settings";
import { PublicPageUrlField } from "@/components/public-page-url-field";
import { ShareQrPanel } from "@/components/share-qr-panel";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/dashboard-context";
import { canAccessCreatorPublicPage } from "@/lib/creator-public-page";
import { getCreatorPageUrl } from "@/lib/platform";

const LOCKED_PAGE_HINT =
  "Publish your page and complete payout verification to unlock your public tip link.";

export function CreatorPublicPageSettings() {
  const { tribe, token, profile, onProfileChange } = useDashboard();
  const shareable = canAccessCreatorPublicPage(tribe, profile);
  const publicPageUrl = getCreatorPageUrl(tribe.username);

  return (
    <>
      <DashboardPageHeader
        title="Public page"
        description="How supporters find you and what they see on your tip page."
        action={
          shareable ? (
            <a href={publicPageUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" type="button">
                Open live page
              </Button>
            </a>
          ) : (
            <Button variant="secondary" type="button" disabled title={LOCKED_PAGE_HINT}>
              Open live page
            </Button>
          )
        }
      />

      <div className="space-y-5 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <PublicPageUrlField username={tribe.username} profile={profile} shareable={shareable} />
        <ShareQrPanel token={token} shareable={shareable} />

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

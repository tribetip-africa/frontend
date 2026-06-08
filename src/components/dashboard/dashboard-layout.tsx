"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PaystackOnboardingModal } from "@/components/paystack-onboarding-modal";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardRoleGuard } from "@/components/dashboard/dashboard-role-guard";
import { DashboardProvider } from "@/context/dashboard-context";
import { useAuth } from "@/context/auth-context";
import { API_BASE, checkApiHealth, fetchMyProfile } from "@/lib/api";
import { isPaystackOnboardingComplete } from "@/lib/paystack-onboarding";
import { getDisplayMessage } from "@/lib/errors";
import { isPublicPageShareable } from "@/lib/creator-public-page";
import { dashboardNavGroupsForRole } from "@/lib/dashboard-nav";
import { canAccessCreatorPublicPage } from "@/lib/creator-public-page";
import { setStoredAuth } from "@/lib/auth-storage";
import { getCreatorPageUrl } from "@/lib/platform";
import { isAdminRole } from "@/lib/roles";
import type { CreatorProfile } from "@/types/api";

const LOCKED_PAGE_HINT =
  "Publish your page and complete payout verification to unlock your public tip link.";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { tribe, token, isLoading } = useAuth();
  const signingOut = useRef(false);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const isAdmin = isAdminRole(tribe?.role);
  const onboardingSource = profile ?? tribe;
  const showOnboardingModal = Boolean(
    tribe && token && !isAdmin && onboardingSource && !isPaystackOnboardingComplete(onboardingSource),
  );

  function handleProfileChange(loadedProfile: CreatorProfile) {
    setProfile(loadedProfile);
    if (tribe && token) {
      setStoredAuth(token, {
        ...tribe,
        account_status: loadedProfile.account_status,
        paystack_onboarding: loadedProfile.paystack_onboarding,
        public_page_shareable: isPublicPageShareable(loadedProfile),
      });
    }
  }

  useEffect(() => {
    if (!isLoading && !tribe && !signingOut.current) {
      router.replace("/sign-in");
    }
  }, [isLoading, tribe, router]);

  useEffect(() => {
    if (!token || !tribe || isAdmin) return;
    if (!isPaystackOnboardingComplete(tribe)) return;

    fetchMyProfile(token)
      .then(handleProfileChange)
      .catch((error) => setProfileError(getDisplayMessage(error)));
  }, [token, isAdmin, tribe?.paystack_onboarding.complete]);

  useEffect(() => {
    checkApiHealth().then((ok) => {
      if (!ok) {
        console.warn("API health check failed — is the Rails server running?", API_BASE);
      }
    });
  }, []);

  if (isLoading || !tribe || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-700">
        Loading…
      </div>
    );
  }

  const shareable = canAccessCreatorPublicPage(tribe, profile);
  const publicPageUrl = getCreatorPageUrl(tribe.username);
  const navGroups = dashboardNavGroupsForRole(isAdmin ? "admin" : "creator");
  const quickLinks = isAdmin
    ? [{ href: "/", label: "Marketing site" }]
    : [
        {
          href: shareable ? publicPageUrl : undefined,
          label: "View public page",
          external: true,
          disabled: !shareable,
          title: shareable ? undefined : LOCKED_PAGE_HINT,
        },
        { href: "/", label: "Marketing site" },
      ];

  return (
    <DashboardProvider
      value={{
        tribe,
        token,
        isAdmin,
        profile,
        profileError,
        onProfileChange: handleProfileChange,
        blurred: showOnboardingModal,
      }}
    >
      <DashboardRoleGuard isAdmin={isAdmin}>
        <DashboardShell navGroups={navGroups} quickLinks={quickLinks} blurred={showOnboardingModal}>
          {children}
        </DashboardShell>
      </DashboardRoleGuard>

      {showOnboardingModal && (
        <PaystackOnboardingModal open token={token} username={tribe.username} />
      )}
    </DashboardProvider>
  );
}

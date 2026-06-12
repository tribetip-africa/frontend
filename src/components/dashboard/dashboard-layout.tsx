"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PaystackOnboardingModal } from "@/components/paystack-onboarding-modal";
import { PayoutSetupSuccess } from "@/components/payout-setup-success";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
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
import type { CreatorProfile, Tribe } from "@/types/api";

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
  const [payoutSuccessVisible, setPayoutSuccessVisible] = useState(false);

  const isAdmin = isAdminRole(tribe?.role);
  const onboardingComplete =
    isPaystackOnboardingComplete(tribe) || isPaystackOnboardingComplete(profile);
  const showOnboardingModal = Boolean(tribe && token && !isAdmin && !onboardingComplete);

  const handleProfileChange = useCallback((loadedProfile: CreatorProfile) => {
    setProfile(loadedProfile);
    if (tribe && token) {
      setStoredAuth(token, {
        ...tribe,
        account_status: loadedProfile.account_status,
        paystack_onboarding: loadedProfile.paystack_onboarding,
        public_page_shareable: isPublicPageShareable(loadedProfile),
      });
    }
  }, [tribe, token]);

  const handleOnboardingComplete = useCallback(
    (updatedTribe: Tribe) => {
      if (token) {
        setStoredAuth(token, updatedTribe);
      }

      setPayoutSuccessVisible(true);

      fetchMyProfile(token!)
        .then(handleProfileChange)
        .catch((error) => setProfileError(getDisplayMessage(error)));
    },
    [token, handleProfileChange],
  );

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
  }, [token, isAdmin, tribe, handleProfileChange]);

  useEffect(() => {
    checkApiHealth().then((ok) => {
      if (!ok) {
        console.warn("API health check failed — is the Rails server running?", API_BASE);
      }
    });
  }, []);

  if (isLoading || !tribe || !token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream text-brand-700">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        <p className="text-sm font-medium">Loading your workspace…</p>
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
          {!isAdmin && (
            <div className="pointer-events-auto fixed right-4 top-4 z-[60] sm:right-6 lg:top-6">
              <DashboardNotifications token={token} enabled={!showOnboardingModal} />
            </div>
          )}
          {children}
        </DashboardShell>
      </DashboardRoleGuard>

      {showOnboardingModal && (
        <PaystackOnboardingModal
          open
          token={token}
          username={tribe.username}
          onComplete={handleOnboardingComplete}
        />
      )}

      <PayoutSetupSuccess
        visible={payoutSuccessVisible}
        onDismiss={() => setPayoutSuccessVisible(false)}
      />
    </DashboardProvider>
  );
}

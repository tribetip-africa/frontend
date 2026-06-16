import type { CreatorProfile, Tribe } from "@/types/api";
import { isPaystackSubaccountVerified } from "@/lib/paystack-onboarding";
import { getCreatorPageDisplayUrl } from "@/lib/platform";

export type PublicPageReadiness = Pick<
  CreatorProfile,
  "is_profile_public" | "paystack_onboarding" | "metrics"
>;

export function isPublicPageShareable(
  profile: PublicPageReadiness | null | undefined,
): boolean {
  if (!profile?.is_profile_public) return false;

  if (profile.metrics?.subaccount_verified === true) return true;
  return isPaystackSubaccountVerified(profile);
}

export function canAccessCreatorPublicPage(
  tribe: Pick<Tribe, "role"> | null | undefined,
  profile: PublicPageReadiness | null | undefined,
): boolean {
  if (!tribe || tribe.role === "admin") return false;
  return isPublicPageShareable(profile);
}

export function maskPublicPageDisplayUrl(username: string): string {
  const visible = getCreatorPageDisplayUrl(username);
  return visible.replace(/[A-Za-z0-9]/g, "*");
}

export function publicPageDisplayUrl(
  username: string,
  shareable: boolean,
): string {
  return shareable ? getCreatorPageDisplayUrl(username) : maskPublicPageDisplayUrl(username);
}

export function publicPageShareHint(
  profile: PublicPageReadiness | null | undefined,
): string {
  if (!profile) {
    return "Complete payout setup to preview your public link.";
  }

  const verified =
    profile.metrics?.subaccount_verified === true ||
    isPaystackSubaccountVerified(profile);

  if (!verified && !profile.is_profile_public) {
    return "Your link unlocks after Paystack verifies your payout account and you publish your page.";
  }

  if (!verified) {
    return "Paystack is still verifying your payout account. Your link stays hidden until verification completes.";
  }

  if (!profile.is_profile_public) {
    return "Publish your page to reveal and share your public tip link.";
  }

  return "Share your link or QR code so supporters can tip you.";
}

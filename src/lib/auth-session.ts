import { TribetipApiError } from "@/lib/errors";
import { isPublicPageShareable } from "@/lib/creator-public-page";
import type { CreatorProfile } from "@/types/api";
import { setStoredAuth } from "@/lib/auth-storage";

export async function validateStoredSession(token?: string | null): Promise<CreatorProfile | null> {
  try {
    const { fetchMyProfile } = await import("@/lib/api");
    const profile = await fetchMyProfile(token);
    setStoredAuth(token ?? null, {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      role: profile.role,
      account_status: profile.account_status,
      paystack_onboarding: profile.paystack_onboarding,
      public_page_shareable: isPublicPageShareable(profile),
    });
    return profile;
  } catch (error) {
    if (isOnboardingRequiredError(error)) {
      return null;
    }
    throw error;
  }
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof TribetipApiError && error.status === 401;
}

export function isReauthenticationRequiredError(error: unknown): boolean {
  return error instanceof TribetipApiError && error.code === "reauthentication_required";
}

export function isOnboardingRequiredError(error: unknown): boolean {
  return error instanceof TribetipApiError && error.code === "onboarding_required";
}

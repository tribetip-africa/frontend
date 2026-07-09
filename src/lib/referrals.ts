import { getPlatformBaseUrl } from "@/lib/platform";

export function getReferralSignupPath(username: string): string {
  return `/sign-up?ref=${encodeURIComponent(username)}`;
}

export function getReferralSignupUrl(username: string): string {
  return `${getPlatformBaseUrl()}${getReferralSignupPath(username)}`;
}

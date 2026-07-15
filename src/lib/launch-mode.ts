export type LaunchMode = "open" | "waitlist" | "coming_soon";

export type LaunchCta = {
  href: string;
  label: string;
};

const LAUNCH_MODES = new Set<LaunchMode>(["open", "waitlist", "coming_soon"]);

/** Matches API early-access token format. */
export const EARLY_ACCESS_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,48}$/;

export const EARLY_ACCESS_COOKIE_NAME = "tribetip_ea";

export function launchMode(): LaunchMode {
  const raw = process.env.NEXT_PUBLIC_LAUNCH_MODE?.trim().toLowerCase();
  if (raw && LAUNCH_MODES.has(raw as LaunchMode)) {
    return raw as LaunchMode;
  }

  return "open";
}

/** Fully public signup (no invite required). */
export function isSignupOpen(): boolean {
  return launchMode() === "open";
}

/** Sign-in stays available during waitlist / coming soon for existing accounts. */
export function isSignInOpen(): boolean {
  return true;
}

export function showWaitlist(): boolean {
  return launchMode() === "waitlist";
}

export function isValidEarlyAccessToken(value: string | null | undefined): boolean {
  return Boolean(value && EARLY_ACCESS_TOKEN_PATTERN.test(value.trim()));
}

/**
 * Signup is allowed when fully open, or when gated and the request carries a
 * valid early-access token (query `ea` or cookie).
 */
export function isSignUpAllowed(input: {
  eaQuery?: string | null;
  eaCookie?: string | null;
}): boolean {
  if (isSignupOpen()) {
    return true;
  }

  return isValidEarlyAccessToken(input.eaQuery) || isValidEarlyAccessToken(input.eaCookie);
}

export function primaryLaunchCta(): LaunchCta | null {
  switch (launchMode()) {
    case "waitlist":
      return { href: "/waitlist", label: "Join waitlist" };
    case "coming_soon":
      return null;
    default:
      return { href: "/sign-up", label: "Start my page" };
  }
}

export function waitlistRedirectPath(): string {
  return launchMode() === "waitlist" ? "/waitlist" : "/";
}

export type LaunchMode = "open" | "waitlist" | "coming_soon";

export type LaunchCta = {
  href: string;
  label: string;
};

const LAUNCH_MODES = new Set<LaunchMode>(["open", "waitlist", "coming_soon"]);

export function launchMode(): LaunchMode {
  const raw = process.env.NEXT_PUBLIC_LAUNCH_MODE?.trim().toLowerCase();
  if (raw && LAUNCH_MODES.has(raw as LaunchMode)) {
    return raw as LaunchMode;
  }

  return "open";
}

export function isSignupOpen(): boolean {
  return launchMode() === "open";
}

export function showWaitlist(): boolean {
  return launchMode() === "waitlist";
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

import {
  isSignInOpen,
  isSignUpAllowed,
  isSignupOpen,
  isValidEarlyAccessToken,
  launchMode,
  primaryLaunchCta,
  showWaitlist,
  waitlistRedirectPath,
} from "@/lib/launch-mode";

describe("launch mode", () => {
  const originalEnv = process.env;
  const sampleToken = "abcdefghijklmnopqrstuv"; // 22 chars

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_LAUNCH_MODE;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("defaults to open signup", () => {
    expect(launchMode()).toBe("open");
    expect(isSignupOpen()).toBe(true);
    expect(isSignInOpen()).toBe(true);
    expect(showWaitlist()).toBe(false);
    expect(primaryLaunchCta()).toEqual({ href: "/sign-up", label: "Start my page" });
    expect(waitlistRedirectPath()).toBe("/");
    expect(isSignUpAllowed({})).toBe(true);
  });

  it("supports waitlist mode with invite-gated signup", () => {
    process.env.NEXT_PUBLIC_LAUNCH_MODE = "waitlist";

    expect(launchMode()).toBe("waitlist");
    expect(isSignupOpen()).toBe(false);
    expect(isSignInOpen()).toBe(true);
    expect(showWaitlist()).toBe(true);
    expect(primaryLaunchCta()).toEqual({ href: "/waitlist", label: "Join waitlist" });
    expect(waitlistRedirectPath()).toBe("/waitlist");
    expect(isSignUpAllowed({})).toBe(false);
    expect(isSignUpAllowed({ eaQuery: sampleToken })).toBe(true);
    expect(isSignUpAllowed({ eaCookie: sampleToken })).toBe(true);
  });

  it("supports coming soon mode", () => {
    process.env.NEXT_PUBLIC_LAUNCH_MODE = "coming_soon";

    expect(launchMode()).toBe("coming_soon");
    expect(isSignupOpen()).toBe(false);
    expect(isSignInOpen()).toBe(true);
    expect(showWaitlist()).toBe(false);
    expect(primaryLaunchCta()).toBeNull();
    expect(waitlistRedirectPath()).toBe("/");
  });

  it("validates early access tokens", () => {
    expect(isValidEarlyAccessToken(sampleToken)).toBe(true);
    expect(isValidEarlyAccessToken("short")).toBe(false);
    expect(isValidEarlyAccessToken(null)).toBe(false);
  });
});

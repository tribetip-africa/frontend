import {
  isSignupOpen,
  launchMode,
  primaryLaunchCta,
  showWaitlist,
  waitlistRedirectPath,
} from "@/lib/launch-mode";

describe("launch mode", () => {
  const originalEnv = process.env;

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
    expect(showWaitlist()).toBe(false);
    expect(primaryLaunchCta()).toEqual({ href: "/sign-up", label: "Start my page" });
    expect(waitlistRedirectPath()).toBe("/");
  });

  it("supports waitlist mode", () => {
    process.env.NEXT_PUBLIC_LAUNCH_MODE = "waitlist";

    expect(launchMode()).toBe("waitlist");
    expect(isSignupOpen()).toBe(false);
    expect(showWaitlist()).toBe(true);
    expect(primaryLaunchCta()).toEqual({ href: "/waitlist", label: "Join waitlist" });
    expect(waitlistRedirectPath()).toBe("/waitlist");
  });

  it("supports coming soon mode", () => {
    process.env.NEXT_PUBLIC_LAUNCH_MODE = "coming_soon";

    expect(launchMode()).toBe("coming_soon");
    expect(isSignupOpen()).toBe(false);
    expect(showWaitlist()).toBe(false);
    expect(primaryLaunchCta()).toBeNull();
    expect(waitlistRedirectPath()).toBe("/");
  });
});

import {
  isMarketingPath,
  isProtectedPath,
  PROTECTED_PATHS,
  MARKETING_PATHS,
} from "@/lib/protected-routes";
import { hasAuthSessionCookie } from "@/lib/auth-cookie";
import { TribetipApiError, parseApiErrorBody } from "@/lib/errors";

describe("protected routes", () => {
  it("marks dashboard as protected", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/dashboard/tips")).toBe(true);
    expect(PROTECTED_PATHS).toContain("/dashboard");
  });

  it("does not protect public routes", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/sign-in")).toBe(false);
    expect(isProtectedPath("/creator")).toBe(false);
  });

  it("marks marketing paths for guest-only redirect", () => {
    expect(isMarketingPath("/")).toBe(true);
    expect(isMarketingPath("/sign-in")).toBe(true);
    expect(isMarketingPath("/sign-up")).toBe(true);
    expect(isMarketingPath("/dashboard")).toBe(false);
    expect(isMarketingPath("/creator")).toBe(false);
    expect(MARKETING_PATHS).toContain("/");
  });
});

describe("auth session cookie", () => {
  it("detects the session marker cookie", () => {
    expect(hasAuthSessionCookie("tribetip_session=1; other=value")).toBe(true);
    expect(hasAuthSessionCookie("other=value")).toBe(false);
  });
});

describe("auth session validation", () => {
  it("detects 401 API errors", async () => {
    const { isUnauthorizedError } = await import("@/lib/auth-session");

    expect(isUnauthorizedError(new TribetipApiError(401, {}))).toBe(true);
    expect(isUnauthorizedError(new TribetipApiError(403, {}))).toBe(false);
    expect(isUnauthorizedError(new Error("nope"))).toBe(false);
  });

  it("detects onboarding_required as an authenticated session", async () => {
    const { isOnboardingRequiredError } = await import("@/lib/auth-session");

    expect(
      isOnboardingRequiredError(
        parseApiErrorBody(403, {
          error: { code: "onboarding_required", message: "Setup" },
        }),
      ),
    ).toBe(true);
    expect(isOnboardingRequiredError(new TribetipApiError(403, {}))).toBe(false);
  });
});

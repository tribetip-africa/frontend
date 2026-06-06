import { isProtectedPath, PROTECTED_PATHS } from "@/lib/protected-routes";
import { hasAuthSessionCookie } from "@/lib/auth-cookie";

describe("protected routes", () => {
  it("marks dashboard as protected", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(PROTECTED_PATHS).toContain("/dashboard");
  });

  it("does not protect public routes", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/sign-in")).toBe(false);
  });
});

describe("auth session cookie", () => {
  it("detects the session marker cookie", () => {
    expect(hasAuthSessionCookie("tribetip_session=1; other=value")).toBe(true);
    expect(hasAuthSessionCookie("other=value")).toBe(false);
  });
});

import { isAdminRole } from "@/lib/roles";
import { isProtectedPath, normalizeAuthRedirectPath } from "@/lib/protected-routes";

describe("roles", () => {
  it("detects admin role", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("creator")).toBe(false);
  });
});

describe("protected routes", () => {
  it("protects only the dashboard", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/admin")).toBe(false);
    expect(isProtectedPath("/sign-in")).toBe(false);
  });

  it("normalizes legacy admin redirects to dashboard", () => {
    expect(normalizeAuthRedirectPath("/admin")).toBe("/dashboard");
    expect(normalizeAuthRedirectPath("/dashboard")).toBe("/dashboard");
    expect(normalizeAuthRedirectPath(null)).toBe("/dashboard");
  });
});

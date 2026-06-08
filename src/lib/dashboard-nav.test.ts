import {
  CREATOR_DASHBOARD_NAV,
  ADMIN_DASHBOARD_NAV,
  isAdminDashboardPath,
  isCreatorDashboardPath,
} from "@/lib/dashboard-nav";

describe("dashboard nav", () => {
  it("groups creator sections by relevance", () => {
    expect(CREATOR_DASHBOARD_NAV.map((group) => group.label)).toEqual([
      "Earnings",
      "Your page",
      "Money & account",
    ]);
  });

  it("groups admin sections together", () => {
    expect(ADMIN_DASHBOARD_NAV[0]?.items).toHaveLength(2);
  });

  it("identifies role-specific dashboard paths", () => {
    expect(isCreatorDashboardPath("/dashboard/tips")).toBe(true);
    expect(isCreatorDashboardPath("/dashboard/public-page")).toBe(true);
    expect(isAdminDashboardPath("/dashboard/accounts")).toBe(true);
    expect(isCreatorDashboardPath("/dashboard/accounts")).toBe(false);
    expect(isAdminDashboardPath("/dashboard/tips")).toBe(false);
  });
});

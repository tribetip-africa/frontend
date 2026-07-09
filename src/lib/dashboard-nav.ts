export type DashboardNavLink = {
  id: string;
  href: string;
  label: string;
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavLink[];
};

export const CREATOR_DASHBOARD_NAV: DashboardNavGroup[] = [
  {
    label: "Earnings",
    items: [
      { id: "overview", href: "/dashboard", label: "Overview" },
      { id: "tips", href: "/dashboard/tips", label: "Tips & earnings" },
    ],
  },
  {
    label: "Your page",
    items: [
      { id: "public-page", href: "/dashboard/public-page", label: "Public page" },
      { id: "referrals", href: "/dashboard/referrals", label: "Invite creators" },
    ],
  },
  {
    label: "Integrations",
    items: [{ id: "widget", href: "/dashboard/widget", label: "Website widget" }],
  },
  {
    label: "Money & account",
    items: [
      { id: "payouts", href: "/dashboard/payouts", label: "Payouts" },
      { id: "notifications", href: "/dashboard/notifications", label: "Notifications" },
      { id: "account", href: "/dashboard/account", label: "Account" },
    ],
  },
];

export const ADMIN_DASHBOARD_NAV: DashboardNavGroup[] = [
  {
    label: "Platform",
    items: [
      { id: "overview", href: "/dashboard", label: "Overview" },
      { id: "accounts", href: "/dashboard/accounts", label: "Creator accounts" },
    ],
  },
];

export const CREATOR_DASHBOARD_PATHS = [
  "/dashboard/tips",
  "/dashboard/public-page",
  "/dashboard/referrals",
  "/dashboard/widget",
  "/dashboard/payouts",
  "/dashboard/notifications",
  "/dashboard/account",
] as const;

export const ADMIN_DASHBOARD_PATHS = ["/dashboard/accounts"] as const;

export function flattenDashboardNav(groups: DashboardNavGroup[]): DashboardNavLink[] {
  return groups.flatMap((group) => group.items);
}

export function isCreatorDashboardPath(pathname: string): boolean {
  return CREATOR_DASHBOARD_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function isAdminDashboardPath(pathname: string): boolean {
  return ADMIN_DASHBOARD_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function dashboardNavGroupsForRole(role: "creator" | "admin"): DashboardNavGroup[] {
  return role === "admin" ? ADMIN_DASHBOARD_NAV : CREATOR_DASHBOARD_NAV;
}

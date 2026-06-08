import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
import type { DashboardNavGroup } from "@/lib/dashboard-nav";

type DashboardShellProps = {
  children: ReactNode;
  navGroups: DashboardNavGroup[];
  quickLinks?: Array<{
    href?: string;
    label: string;
    external?: boolean;
    disabled?: boolean;
    title?: string;
  }>;
  blurred?: boolean;
};

export function DashboardShell({
  children,
  navGroups,
  quickLinks,
  blurred = false,
}: DashboardShellProps) {
  return (
    <>
      <div className={blurred ? "pointer-events-none select-none blur-sm" : undefined}>
        <SiteHeader />
        <div className="pattern-dots border-b border-brand-100/60 bg-cream">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
            <DashboardMobileNav groups={navGroups} quickLinks={quickLinks} />

            <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <DashboardNav groups={navGroups} quickLinks={quickLinks} />
                </div>
              </aside>

              <div className="min-w-0 space-y-6 lg:space-y-8">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
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
  headerActions?: ReactNode;
  blurred?: boolean;
};

export function DashboardShell({
  children,
  navGroups,
  quickLinks,
  headerActions,
  blurred = false,
}: DashboardShellProps) {
  const router = useRouter();
  const { tribe, signOut } = useAuth();

  const handleSignOut = () => {
    signOut().then(() => router.replace("/"));
  };

  return (
    <div
      data-dashboard
      className={`flex h-screen overflow-hidden bg-cream ${blurred ? "pointer-events-none select-none blur-sm" : ""}`}
    >
      <aside className="hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-line bg-surface shadow-[4px_0_24px_rgb(var(--shadow-color)/0.04)] lg:flex">
        <div className="shrink-0 border-b border-line/80 px-5 py-5">
          <Logo href="/dashboard" size="sm" />
          <p className="mt-2 text-xs font-medium text-muted">Creator workspace</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <DashboardNav groups={navGroups} quickLinks={quickLinks} variant="light" />
        </div>

        {tribe && (
          <div className="shrink-0 border-t border-line bg-sand/40 px-4 py-4">
            <div className="rounded-xl border border-line bg-surface px-3 py-3">
              <p className="truncate text-sm font-semibold text-ink">@{tribe.username}</p>
              <p className="truncate text-xs text-muted">{tribe.email}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link href="/">
                  <Button variant="ghost" type="button" className="w-full !rounded-lg px-2 py-2 text-xs">
                    Site
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  type="button"
                  className="w-full !rounded-lg px-2 py-2 text-xs"
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="dashboard-workspace min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-dashboard px-4 py-5 sm:px-6 sm:py-8">
          <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
            <div className="min-w-0 flex-1">
              <DashboardMobileNav groups={navGroups} quickLinks={quickLinks} />
            </div>
            {headerActions && <div className="pointer-events-auto shrink-0">{headerActions}</div>}
          </div>
          {headerActions && (
            <div className="mb-4 hidden justify-end lg:flex">
              <div className="pointer-events-auto">{headerActions}</div>
            </div>
          )}
          <div className="min-w-0 space-y-5 sm:space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

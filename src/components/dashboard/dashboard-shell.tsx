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
  blurred?: boolean;
};

export function DashboardShell({
  children,
  navGroups,
  quickLinks,
  blurred = false,
}: DashboardShellProps) {
  const router = useRouter();
  const { tribe, signOut } = useAuth();

  const handleSignOut = () => {
    signOut().then(() => router.replace("/"));
  };

  return (
    <div className={`flex min-h-screen bg-cream ${blurred ? "pointer-events-none select-none blur-sm" : ""}`}>
      <aside className="hidden w-60 shrink-0 flex-col bg-white lg:flex">
        <div className="px-5 py-5">
          <Logo href="/dashboard" size="sm" />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <DashboardNav groups={navGroups} quickLinks={quickLinks} variant="light" />
        </div>

        {tribe && (
          <div className="px-4 py-4">
            <p className="truncate text-sm font-semibold text-ink">@{tribe.username}</p>
            <p className="truncate text-xs text-muted">{tribe.email}</p>
            <div className="mt-3 flex gap-2">
              <Link href="/" className="flex-1">
                <Button variant="ghost" type="button" className="w-full text-xs">
                  Site
                </Button>
              </Link>
              <Button variant="ghost" type="button" className="flex-1 text-xs" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-cream">
        <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
          <DashboardMobileNav groups={navGroups} quickLinks={quickLinks} />
          <div className="min-w-0 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

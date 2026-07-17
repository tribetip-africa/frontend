"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import type { DashboardNavGroup } from "@/lib/dashboard-nav";
import { flattenDashboardNav } from "@/lib/dashboard-nav";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

type DashboardMobileNavProps = {
  groups: DashboardNavGroup[];
  quickLinks?: Array<{
    href?: string;
    label: string;
    external?: boolean;
    disabled?: boolean;
    title?: string;
  }>;
};

function dashboardPageTitle(pathname: string, groups: DashboardNavGroup[]): string {
  const items = flattenDashboardNav(groups);

  for (const item of items) {
    if (item.href === "/dashboard" && pathname === "/dashboard") {
      return item.label;
    }

    if (item.href !== "/dashboard" && (pathname === item.href || pathname.startsWith(`${item.href}/`))) {
      return item.label;
    }
  }

  return "Dashboard";
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        d="M4 7h16M4 12h16M4 17h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        d="M6 6l12 12M18 6 6 18"
      />
    </svg>
  );
}

export function DashboardMobileNav({ groups, quickLinks }: DashboardMobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { tribe, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const pageTitle = dashboardPageTitle(pathname, groups);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSignOut = () => {
    signOut().then(() => router.replace("/"));
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink shadow-sm transition hover:bg-sand"
            aria-label="Open dashboard menu"
            aria-expanded={open}
            aria-controls="dashboard-mobile-drawer"
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </button>
          <p className="min-w-0 truncate font-display text-sm font-bold text-ink">
            {pageTitle}
          </p>
        </div>
        <Logo href="/dashboard" size="sm" className="shrink-0" />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            aria-label="Close dashboard menu"
            onClick={() => setOpen(false)}
          />

          <aside
            id="dashboard-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard menu"
            className="absolute inset-y-0 left-0 flex w-[min(100%,300px)] flex-col bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-4">
              <Logo href="/dashboard" size="sm" />
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-sand"
                aria-label="Close dashboard menu"
                onClick={() => setOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <DashboardNav
                groups={groups}
                quickLinks={quickLinks}
                variant="light"
                onNavigate={() => setOpen(false)}
              />
            </div>

            {tribe && (
              <div className="px-4 py-4">
                <p className="mb-3 truncate text-sm font-semibold text-ink">@{tribe.username}</p>
                <div className="flex gap-2">
                  <Link href="/" className="flex-1" onClick={() => setOpen(false)}>
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
        </div>
      )}
    </>
  );
}

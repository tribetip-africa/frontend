"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import type { DashboardNavGroup } from "@/lib/dashboard-nav";
import { flattenDashboardNav } from "@/lib/dashboard-nav";

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

  return (
    <>
      <div className="mb-5 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-200 bg-white text-brand-800 shadow-sm"
          aria-label="Open dashboard menu"
          aria-expanded={open}
          aria-controls="dashboard-mobile-drawer"
          onClick={() => setOpen(true)}
        >
          <MenuIcon />
        </button>
        <p className="min-w-0 truncate text-sm font-semibold text-brand-900">{pageTitle}</p>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
            aria-label="Close dashboard menu"
            onClick={() => setOpen(false)}
          />

          <aside
            id="dashboard-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard menu"
            className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col border-r border-brand-100 bg-cream shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-brand-100 px-4 py-4">
              <p className="text-sm font-semibold text-brand-900">Menu</p>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-700 hover:bg-brand-100"
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
                onNavigate={() => setOpen(false)}
              />
            </div>

            <div className="border-t border-brand-100 px-4 py-3">
              <Link
                href="/"
                className="block rounded-xl px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
                onClick={() => setOpen(false)}
              >
                Back to site
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

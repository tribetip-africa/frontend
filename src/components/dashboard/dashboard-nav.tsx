"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardNavGroup } from "@/lib/dashboard-nav";

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
};

type DashboardNavProps = {
  groups: DashboardNavGroup[];
  quickLinks?: Array<{
    href?: string;
    label: string;
    external?: boolean;
    disabled?: boolean;
    title?: string;
  }>;
  onNavigate?: () => void;
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemClass(isActive: boolean) {
  return isActive
    ? "border-brand-600 bg-brand-50 text-brand-900"
    : "border-transparent text-brand-700 hover:border-brand-200 hover:bg-brand-50/70 hover:text-brand-900";
}

export function DashboardNav({ groups, quickLinks, onNavigate }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-brand-500">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-xl border px-3 py-2 text-sm font-medium transition ${navItemClass(active)}`}
                    onClick={onNavigate}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {quickLinks && quickLinks.length > 0 && (
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-brand-500">
            Quick links
          </p>
          <ul className="space-y-1">
            {quickLinks.map((link) => (
              <li key={link.label}>
                {link.disabled || !link.href ? (
                  <span
                    title={link.title}
                    className="block cursor-not-allowed rounded-xl px-3 py-2 text-sm font-medium text-brand-400"
                  >
                    {link.label}
                  </span>
                ) : (
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 hover:text-brand-900"
                    onClick={onNavigate}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

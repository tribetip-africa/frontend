"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardNavIcon } from "@/components/dashboard/dashboard-nav-icons";
import type { DashboardNavGroup } from "@/lib/dashboard-nav";

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
  variant?: "light" | "dark";
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemClass(isActive: boolean, variant: "light" | "dark") {
  if (variant === "dark") {
    return isActive
      ? "bg-white/10 text-white border-l-2 border-accent pl-[10px]"
      : "text-white/60 hover:bg-white/5 hover:text-white border-l-2 border-transparent pl-[10px]";
  }

  return isActive
    ? "bg-accent-soft text-ink font-semibold"
    : "text-ink-soft hover:bg-sand hover:text-ink";
}

export function DashboardNav({
  groups,
  quickLinks,
  onNavigate,
  variant = "dark",
}: DashboardNavProps) {
  const pathname = usePathname();
  const groupLabelClass =
    variant === "dark"
      ? "text-white/35"
      : "text-brand-500";

  return (
    <nav aria-label="Dashboard" className="space-y-7">
      {groups.map((group) => (
        <div key={group.label}>
          <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-widest ${groupLabelClass}`}>
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${navItemClass(active, variant)}`}
                    onClick={onNavigate}
                  >
                    <DashboardNavIcon id={item.id} />
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
          <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-widest ${groupLabelClass}`}>
            Quick links
          </p>
          <ul className="space-y-0.5">
            {quickLinks.map((link) => (
              <li key={link.label}>
                {link.disabled || !link.href ? (
                  <span
                    title={link.title}
                    className={`block cursor-not-allowed rounded-xl px-3 py-2.5 text-sm font-medium ${
                      variant === "dark" ? "text-white/25" : "text-brand-400"
                    }`}
                  >
                    {link.label}
                  </span>
                ) : (
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      variant === "dark"
                        ? "text-white/60 hover:bg-white/5 hover:text-white"
                        : "text-brand-700 hover:bg-brand-50 hover:text-brand-900"
                    }`}
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

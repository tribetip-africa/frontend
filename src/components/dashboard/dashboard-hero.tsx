import type { ReactNode } from "react";

type DashboardHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  badges?: ReactNode;
  actions?: ReactNode;
};

export function DashboardHero({
  eyebrow,
  title,
  description,
  badges,
  actions,
}: DashboardHeroProps) {
  return (
    <header className="rounded-2xl border border-brand-100 bg-gradient-to-br from-white via-white to-brand-50/80 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {eyebrow}
            </p>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-brand-700 sm:text-base">{description}</p>
          </div>
          {badges && <div className="flex flex-wrap gap-2">{badges}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function StatusBadge({
  tone = "neutral",
  children,
}: {
  tone?: "success" | "warning" | "danger" | "neutral";
  children: React.ReactNode;
}) {
  const styles = {
    success: "border-green-200 bg-green-50 text-green-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-red-200 bg-red-50 text-red-800",
    neutral: "border-brand-200 bg-brand-50 text-brand-800",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${styles}`}>
      {children}
    </span>
  );
}

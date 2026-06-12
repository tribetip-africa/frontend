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
    <header className="surface-card rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600">{eyebrow}</p>
          )}
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-ink-soft sm:text-base">{description}</p>
          </div>
          {badges && <div className="flex flex-wrap gap-2 pt-1">{badges}</div>}
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
    success: "bg-brand-50 text-brand-700",
    warning: "bg-accent-soft text-ink",
    danger: "bg-coral-soft text-coral",
    neutral: "bg-sand text-ink-soft",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {children}
    </span>
  );
}

import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DashboardPageHeader({ title, description, action }: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-brand-900/8 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-brand-700">{description}</p>}
      </div>
      {action}
    </div>
  );
}

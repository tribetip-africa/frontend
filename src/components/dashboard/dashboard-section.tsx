import type { ReactNode } from "react";

type DashboardSectionProps = {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function DashboardSection({
  id,
  title,
  description,
  action,
  children,
}: DashboardSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-brand-900">{title}</h2>
          {description && <p className="mt-1 max-w-2xl text-sm text-brand-700">{description}</p>}
        </div>
        {action}
      </div>
      <div className="surface-panel rounded-3xl p-5 sm:p-6">{children}</div>
    </section>
  );
}

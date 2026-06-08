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
          <h2 className="text-lg font-semibold text-brand-900">{title}</h2>
          {description && <p className="mt-1 max-w-2xl text-sm text-brand-700">{description}</p>}
        </div>
        {action}
      </div>
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        {children}
      </div>
    </section>
  );
}

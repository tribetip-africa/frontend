"use client";

import { formatMoney } from "@/lib/money";

export type MetricItem = {
  label: string;
  value: string;
  hint?: string;
};

type MetricsGridProps = {
  metrics: MetricItem[];
  columns?: 2 | 3 | 4;
};

export function MetricsGrid({ metrics, columns = 3 }: MetricsGridProps) {
  const gridClass =
    columns === 4
      ? "sm:grid-cols-2 xl:grid-cols-4"
      : columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <dl className={`grid gap-3 ${gridClass}`}>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="group rounded-2xl border border-brand-900/8 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <dt className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
            {metric.label}
          </dt>
          <dd className="mt-2 font-display text-2xl font-extrabold text-brand-900">{metric.value}</dd>
          {metric.hint && <dd className="mt-1 text-xs text-brand-600">{metric.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function formatVolumeByCurrency(
  volumes: Record<string, number> | undefined,
  fallbackCurrency?: string,
): string {
  if (!volumes || Object.keys(volumes).length === 0) {
    return fallbackCurrency ? formatMoney(0, fallbackCurrency) : "—";
  }

  return Object.entries(volumes)
    .filter(([, cents]) => cents > 0)
    .map(([currency, cents]) => formatMoney(cents, currency))
    .join(" · ");
}

export function formatOptionalMoney(
  amountCents: number | undefined,
  currency: string,
): string {
  if (typeof amountCents !== "number") return "—";
  return formatMoney(amountCents, currency);
}

export function formatOptionalDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

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
          className="rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-sm"
        >
          <dt className="text-xs uppercase tracking-wide text-brand-600">{metric.label}</dt>
          <dd className="mt-1 text-2xl font-semibold text-brand-900">{metric.value}</dd>
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

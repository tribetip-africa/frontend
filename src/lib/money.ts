export const MIN_TIP_UNITS = 1;
/** Major currency units — keep aligned with TRIBETIP_TIP_MAX_CENTS / 100 on the API. */
export const MAX_TIP_UNITS = 100_000;

export function tipAmountWithinLimits(units: number): boolean {
  return Number.isFinite(units) && units >= MIN_TIP_UNITS && units <= MAX_TIP_UNITS;
}

export function centsToUnits(amountCents: number): number {
  return amountCents / 100;
}

export function unitsToCents(units: number): number {
  if (!Number.isFinite(units) || units <= 0) {
    return 0;
  }

  return Math.round(units * 100);
}

export function parseAmountInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function formatMoney(amountCents: number, currency: string): string {
  return formatMoneyUnits(centsToUnits(amountCents), currency);
}

export function formatMoneyUnits(units: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(units);
  } catch {
    return `${currency} ${units.toFixed(2)}`;
  }
}

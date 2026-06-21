import { AFRICAN_MARKETS } from "@/lib/constants";

export function marketForCountry(countryCode: string) {
  return AFRICAN_MARKETS.find((entry) => entry.code === countryCode.toUpperCase());
}

/** "Creator · 🇰🇪 Kenya" for widget cards and previews. */
export function creatorCountryLabel(countryCode: string): string {
  const market = marketForCountry(countryCode);
  if (!market) return "Creator";

  return `Creator · ${market.flag} ${market.name}`;
}

/** "🇰🇪 Kenya" for inline location text (e.g. public profile header). */
export function creatorLocationLabel(countryCode: string, fallback = countryCode): string {
  const market = marketForCountry(countryCode);
  if (!market) return fallback;

  return `${market.flag} ${market.name}`;
}

const WIDGET_PAYMENT_HINTS: Record<string, string> = {
  KE: "No account needed · Pay with M-Pesa or card",
  NG: "No account needed · Pay with card or bank transfer",
  GH: "No account needed · Pay with mobile money or card",
  ZA: "No account needed · Pay with card or EFT",
};

export function widgetPaymentHint(countryCode: string): string {
  return (
    WIDGET_PAYMENT_HINTS[countryCode.toUpperCase()] ??
    "No account needed · Pay securely online"
  );
}

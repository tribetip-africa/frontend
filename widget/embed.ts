export const WIDGET_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,48}$/;

export const WIDGET_POSITIONS = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
] as const;

export type WidgetPosition = (typeof WIDGET_POSITIONS)[number];

export const DEFAULT_WIDGET_ACCENT_COLOR = "#f5b942";
/** Landing-style yellow for tip chips and the support pill. */
export const WIDGET_HIGHLIGHT_COLOR = "#f5b942";
export const DEFAULT_WIDGET_CTA_TEXT = "Tip me";
export const DEFAULT_WIDGET_POSITION: WidgetPosition = "bottom-right";

export function isValidWidgetToken(value: string): boolean {
  return WIDGET_TOKEN_PATTERN.test(value);
}

export function widgetPositionLabel(position: WidgetPosition): string {
  switch (position) {
    case "bottom-left":
      return "Bottom left";
    case "top-right":
      return "Top right";
    case "top-left":
      return "Top left";
    default:
      return "Bottom right";
  }
}

export function widgetSupportLabel(username: string, ctaText?: string | null): string {
  const custom = ctaText?.trim();
  if (custom && custom !== DEFAULT_WIDGET_CTA_TEXT) {
    return custom;
  }

  return `Support @${username}`;
}

export function widgetCountryLabel(countryCode: string): string {
  const markets: Record<string, { flag: string; name: string }> = {
    NG: { flag: "🇳🇬", name: "Nigeria" },
    GH: { flag: "🇬🇭", name: "Ghana" },
    KE: { flag: "🇰🇪", name: "Kenya" },
    ZA: { flag: "🇿🇦", name: "South Africa" },
    CI: { flag: "🇨🇮", name: "Côte d'Ivoire" },
  };

  const market = markets[countryCode.toUpperCase()];
  if (!market) return "Creator";

  return `Creator · ${market.flag} ${market.name}`;
}

export function widgetPaymentHint(countryCode: string): string {
  switch (countryCode.toUpperCase()) {
    case "KE":
      return "No account needed · Pay with M-Pesa or card";
    case "NG":
      return "No account needed · Pay with card or bank transfer";
    case "GH":
      return "No account needed · Pay with mobile money or card";
    case "ZA":
      return "No account needed · Pay with card or EFT";
    default:
      return "No account needed · Pay securely online";
  }
}

export function widgetSetupHint(active: boolean): string {
  if (!active) {
    return "Turn the widget on and set a destination URL to preview your mini tip card.";
  }

  return "Visitors click the card to open your full tip page in a new tab.";
}

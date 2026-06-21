export const WIDGET_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,48}$/;

export const WIDGET_POSITIONS = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
] as const;

export type WidgetPosition = (typeof WIDGET_POSITIONS)[number];

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

export { creatorCountryLabel as widgetCountryLabel, widgetPaymentHint } from "@/lib/market-label";

export function widgetSetupHint(active: boolean): string {
  if (!active) {
    return "Turn the widget on and set a destination URL to preview your mini tip card.";
  }

  return "Visitors click the card to open your full tip page in a new tab.";
}

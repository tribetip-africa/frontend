export const AFRICAN_MARKETS = [
  { code: "NG", name: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", currency: "GHS", flag: "🇬🇭" },
  { code: "KE", name: "Kenya", currency: "KES", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF", flag: "🇨🇮" },
] as const;

export type AfricanMarket = (typeof AFRICAN_MARKETS)[number];

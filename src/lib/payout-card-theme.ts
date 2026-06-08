import { AFRICAN_MARKETS } from "@/lib/constants";

export type PayoutCardTheme = {
  countryCode: string;
  marketName: string;
  flag: string;
  currency: string;
  gradient: string;
  glow: string;
  chip: string;
  label: string;
  network: string;
  accentBar: string;
};

const REGION_THEMES: Record<string, Omit<PayoutCardTheme, "countryCode" | "marketName" | "flag" | "currency">> = {
  NG: {
    gradient: "from-emerald-950 via-green-800 to-lime-700",
    glow: "bg-lime-400/25",
    chip: "from-amber-200 via-yellow-100 to-amber-300",
    label: "Nigeria payout",
    network: "Naira · Bank transfer",
    accentBar: "from-white/30 via-lime-200/40 to-transparent",
  },
  GH: {
    gradient: "from-red-900 via-amber-700 to-emerald-800",
    glow: "bg-amber-300/20",
    chip: "from-amber-200 via-yellow-100 to-amber-300",
    label: "Ghana payout",
    network: "Cedi · Mobile money & bank",
    accentBar: "from-yellow-300/30 via-white/20 to-emerald-400/30",
  },
  KE: {
    gradient: "from-red-800 via-neutral-900 to-green-800",
    glow: "bg-red-400/15",
    chip: "from-amber-200 via-yellow-100 to-amber-300",
    label: "Kenya payout",
    network: "M-Pesa · Mobile money",
    accentBar: "from-red-400/25 via-white/15 to-green-400/25",
  },
  ZA: {
    gradient: "from-green-950 via-emerald-800 to-yellow-600",
    glow: "bg-yellow-300/20",
    chip: "from-amber-200 via-yellow-100 to-amber-300",
    label: "South Africa payout",
    network: "Rand · Bank transfer",
    accentBar: "from-yellow-300/25 via-white/20 to-green-300/25",
  },
  CI: {
    gradient: "from-orange-700 via-white/10 to-emerald-800",
    glow: "bg-orange-300/20",
    chip: "from-amber-200 via-yellow-100 to-amber-300",
    label: "Côte d'Ivoire payout",
    network: "CFA · Mobile money",
    accentBar: "from-orange-300/30 via-white/25 to-emerald-400/30",
  },
};

const DEFAULT_THEME = REGION_THEMES.NG!;

export function payoutCardTheme(countryCode: string, currency: string): PayoutCardTheme {
  const market = AFRICAN_MARKETS.find((entry) => entry.code === countryCode);
  const regional = REGION_THEMES[countryCode] ?? DEFAULT_THEME;

  return {
    countryCode,
    marketName: market?.name ?? countryCode,
    flag: market?.flag ?? "🌍",
    currency: market?.currency ?? currency,
    ...regional,
  };
}

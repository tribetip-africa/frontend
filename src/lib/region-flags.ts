import { AFRICAN_MARKETS, type AfricanMarket } from "@/lib/constants";

export type RegionFlag = AfricanMarket & {
  enabled: boolean;
};

const DEFAULT_FLAGS: Record<AfricanMarket["code"], boolean> = {
  NG: false,
  GH: false,
  KE: true,
  ZA: false,
  CI: false,
};

function parseEnabledRegionsEnv(): Set<string> | null {
  const raw = process.env.NEXT_PUBLIC_ENABLED_REGIONS;
  if (!raw?.trim()) return null;

  return new Set(
    raw
      .split(",")
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean),
  );
}

function perRegionEnvOverrides(): Partial<Record<AfricanMarket["code"], boolean>> {
  const overrides: Partial<Record<AfricanMarket["code"], boolean>> = {};

  for (const market of AFRICAN_MARKETS) {
    const envKey = `NEXT_PUBLIC_REGION_${market.code}_ENABLED`;
    const raw = process.env[envKey];
    if (raw === undefined) continue;

    overrides[market.code] = raw === "true" || raw === "1";
  }

  return overrides;
}

function baseFlags(): Record<AfricanMarket["code"], boolean> {
  const envSet = parseEnabledRegionsEnv();
  if (envSet) {
    return Object.fromEntries(
      AFRICAN_MARKETS.map((market) => [market.code, envSet.has(market.code)]),
    ) as Record<AfricanMarket["code"], boolean>;
  }

  return { ...DEFAULT_FLAGS };
}

export function regionFlags(): Record<AfricanMarket["code"], boolean> {
  const flags = baseFlags();
  const overrides = perRegionEnvOverrides();

  for (const [code, enabled] of Object.entries(overrides) as Array<
    [AfricanMarket["code"], boolean]
  >) {
    flags[code] = enabled;
  }

  return flags;
}

export function isRegionEnabled(countryCode: string): boolean {
  const code = countryCode.toUpperCase() as AfricanMarket["code"];
  return regionFlags()[code] === true;
}

export function enabledMarkets(): RegionFlag[] {
  const flags = regionFlags();
  return AFRICAN_MARKETS.filter((market) => flags[market.code]).map((market) => ({
    ...market,
    enabled: true,
  }));
}

export function allMarketsWithFlags(): RegionFlag[] {
  const flags = regionFlags();
  return AFRICAN_MARKETS.map((market) => ({
    ...market,
    enabled: flags[market.code] === true,
  }));
}

export function defaultMarket(): RegionFlag {
  const markets = enabledMarkets();
  return markets[0] ?? { ...AFRICAN_MARKETS.find((m) => m.code === "KE")!, enabled: true };
}

export const DEFAULT_REGION_CODE = "KE" as const;

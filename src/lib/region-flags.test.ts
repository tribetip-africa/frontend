import {
  DEFAULT_REGION_CODE,
  defaultMarket,
  enabledMarkets,
  isRegionEnabled,
  regionFlags,
} from "@/lib/region-flags";

describe("region flags", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: "development" };
    delete process.env.NEXT_PUBLIC_ENABLED_REGIONS;
    delete process.env.NEXT_PUBLIC_REGION_NG_ENABLED;
    delete process.env.NEXT_PUBLIC_REGION_KE_ENABLED;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("enables only Kenya by default", () => {
    expect(regionFlags()).toEqual({
      NG: false,
      GH: false,
      KE: true,
      ZA: false,
      CI: false,
    });
    expect(enabledMarkets().map((market) => market.code)).toEqual(["KE"]);
    expect(defaultMarket().code).toBe(DEFAULT_REGION_CODE);
  });

  it("supports comma-separated env overrides", () => {
    process.env.NEXT_PUBLIC_ENABLED_REGIONS = "KE,NG";

    expect(isRegionEnabled("NG")).toBe(true);
    expect(isRegionEnabled("GH")).toBe(false);
    expect(enabledMarkets().map((market) => market.code)).toEqual(["NG", "KE"]);
  });

  it("supports per-region env flags", () => {
    process.env.NEXT_PUBLIC_REGION_NG_ENABLED = "true";

    expect(isRegionEnabled("NG")).toBe(true);
    expect(isRegionEnabled("KE")).toBe(true);
  });
});

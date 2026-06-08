import { buildTipPresets } from "@/lib/tip-amounts";

describe("buildTipPresets", () => {
  it("builds standard, generous, and custom presets", () => {
    const presets = buildTipPresets(50_000, "NGN");

    expect(presets).toHaveLength(3);
    expect(presets[0]?.id).toBe("standard");
    expect(presets[1]?.id).toBe("generous");
    expect(presets[2]?.id).toBe("custom");
    expect(presets[0]?.cents).toBe(50_000);
    expect(presets[1]?.cents).toBe(100_000);
    expect(presets[2]?.cents).toBeNull();
  });
});

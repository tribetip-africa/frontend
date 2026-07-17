import {
  centsToUnits,
  formatMoney,
  parseAmountInput,
  tipAmountWithinLimits,
  unitsToCents,
} from "@/lib/money";

describe("formatMoney", () => {
  it("formats supported currencies", () => {
    expect(formatMoney(50_000, "NGN")).toMatch(/500/);
  });

  it("falls back when currency formatting fails", () => {
    expect(formatMoney(12_345, "INVALID")).toBe("INVALID 123.45");
  });
});

describe("amount conversion", () => {
  it("converts between units and cents", () => {
    expect(centsToUnits(50_000)).toBe(500);
    expect(unitsToCents(500)).toBe(50_000);
    expect(unitsToCents(1.5)).toBe(150);
  });

  it("parses valid amount input", () => {
    expect(parseAmountInput("500")).toBe(500);
    expect(parseAmountInput(" 1.5 ")).toBe(1.5);
    expect(parseAmountInput("")).toBeNull();
    expect(parseAmountInput("0")).toBeNull();
  });

  it("enforces tip amount bounds in major units", () => {
    expect(tipAmountWithinLimits(1)).toBe(true);
    expect(tipAmountWithinLimits(100_000)).toBe(true);
    expect(tipAmountWithinLimits(0.5)).toBe(false);
    expect(tipAmountWithinLimits(100_001)).toBe(false);
  });
});

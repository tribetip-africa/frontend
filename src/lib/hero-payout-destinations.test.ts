import { HERO_PAYOUT_METHODS } from "@/lib/hero-payout-destinations";

describe("hero payout methods", () => {
  it("lists distinct payout rails without repeated bank copy", () => {
    const labels = HERO_PAYOUT_METHODS.map((method) => method.label);
    const bankMentions = labels.filter((label) => /bank/i.test(label));

    expect(HERO_PAYOUT_METHODS.length).toBeGreaterThan(4);
    expect(bankMentions).toEqual(["bank transfer"]);
    expect(new Set(HERO_PAYOUT_METHODS.map((method) => method.id)).size).toBe(
      HERO_PAYOUT_METHODS.length,
    );
  });

  it("includes mobile money options used across African markets", () => {
    const labels = HERO_PAYOUT_METHODS.map((method) => method.label).join(" ");
    expect(labels).toMatch(/M-Pesa/i);
    expect(labels).toMatch(/MTN MoMo/i);
    expect(labels).toMatch(/Orange Money/i);
  });
});

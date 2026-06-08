import { payoutCardTheme } from "@/lib/payout-card-theme";

describe("payoutCardTheme", () => {
  it("returns Kenya-specific styling", () => {
    const theme = payoutCardTheme("KE", "KES");
    expect(theme.marketName).toBe("Kenya");
    expect(theme.network).toMatch(/M-Pesa/i);
    expect(theme.currency).toBe("KES");
  });

  it("falls back for unknown regions", () => {
    const theme = payoutCardTheme("XX", "USD");
    expect(theme.gradient).toBeTruthy();
    expect(theme.currency).toBe("USD");
  });
});

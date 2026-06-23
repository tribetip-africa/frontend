import { parsePayoutDestination, formatPayoutDestination } from "@/lib/payout-destination";

describe("payout destination helpers", () => {
  it("parses bank and masked account parts", () => {
    expect(parsePayoutDestination("MPESA · ••••••5678")).toEqual({
      label: "MPESA",
      account: "••••••5678",
    });
  });

  it("treats a single value as the account portion", () => {
    expect(parsePayoutDestination("••••••5678")).toEqual({
      label: null,
      account: "••••••5678",
    });
  });

  it("formats destination labels with account numbers", () => {
    expect(formatPayoutDestination("MPESA", "0712345678")).toBe("MPESA · 0712345678");
    expect(formatPayoutDestination(null, "0712345678")).toBe("0712345678");
  });
});

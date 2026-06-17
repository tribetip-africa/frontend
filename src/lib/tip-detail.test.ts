import { formatTipPaidVia, tipSupporterLabel } from "@/lib/tip-detail";

describe("tip detail helpers", () => {
  it("formats paid_via labels", () => {
    expect(formatTipPaidVia("webhook")).toMatch(/webhook/i);
    expect(formatTipPaidVia("reconcile")).toMatch(/checkout/i);
    expect(formatTipPaidVia(undefined)).toBeNull();
  });

  it("prefers supporter name over email", () => {
    expect(
      tipSupporterLabel({
        supporter_name: "Amina",
        supporter_email: "amina@example.com",
      }),
    ).toBe("Amina");
  });
});

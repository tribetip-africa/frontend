import { checkoutPhaseLabel, isCheckoutStillProcessing } from "@/lib/tip-checkout";

describe("tip checkout helpers", () => {
  it("detects still-processing API messages", () => {
    expect(isCheckoutStillProcessing("Payout setup is still processing. Please wait.")).toBe(true);
    expect(isCheckoutStillProcessing("Validation failed.")).toBe(false);
  });

  it("labels checkout phases for the tip form", () => {
    expect(checkoutPhaseLabel("starting")).toBe("Starting checkout…");
    expect(checkoutPhaseLabel("polling")).toBe("Preparing Paystack checkout…");
    expect(checkoutPhaseLabel("redirecting")).toBe("Redirecting to Paystack…");
  });
});

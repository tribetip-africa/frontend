import { widgetSupportLabel } from "@/widget/embed";

describe("widget embed helpers", () => {
  it("builds a landing-style support label by default", () => {
    expect(widgetSupportLabel("ama_creates")).toBe("Support @ama_creates");
  });

  it("respects a custom CTA label", () => {
    expect(widgetSupportLabel("ama_creates", "Buy me a coffee")).toBe("Buy me a coffee");
  });

  it("falls back to support label when CTA is the legacy default", () => {
    expect(widgetSupportLabel("ama_creates", "Tip me")).toBe("Support @ama_creates");
  });
});

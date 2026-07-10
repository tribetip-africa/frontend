import { faqItemAnchorId, faqItemUrl } from "@/lib/faq-slug";

describe("faq slug", () => {
  it("builds stable category-prefixed anchor ids", () => {
    expect(faqItemAnchorId("getting-started", "What is TribeTip?")).toBe(
      "getting-started-what-is-tribetip",
    );
  });

  it("builds FAQ deep links", () => {
    expect(faqItemUrl("payments-fees", "How much does TribeTip charge?")).toBe(
      "/faq#payments-fees-how-much-does-tribetip-charge",
    );
  });
});

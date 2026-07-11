import { buildLlmsTxt } from "@/lib/llms-content";

describe("llms content", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
    process.env.NODE_ENV = "development";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("includes core TribeTip facts and FAQ deep links", () => {
    const content = buildLlmsTxt();

    expect(content).toContain("# TribeTip");
    expect(content).toContain("http://localhost:3000/faq");
    expect(content).toContain("http://localhost:3000/for-creators");
    expect(content).toContain("TribeTip is a tipping platform");
    expect(content).toContain(
      "http://localhost:3000/faq#getting-started-what-is-tribetip",
    );
    expect(content).toContain("support@tribetip.africa");
  });
});

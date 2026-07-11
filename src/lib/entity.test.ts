import { entityFacts, organizationSameAs } from "@/lib/entity";

describe("entity", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
    delete process.env.NEXT_PUBLIC_SOCIAL_X_URL;
    delete process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL;
    delete process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL;
    process.env.NODE_ENV = "development";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("exposes consistent TribeTip facts for SEO and GEO surfaces", () => {
    expect(entityFacts()).toMatchObject({
      name: "TribeTip",
      legalName: "TribeTip Africa",
      url: "http://localhost:3000",
      creatorPageExample: "localhost:3000/your-username",
      supportEmail: "support@tribetip.africa",
    });
    expect(entityFacts().definition).toContain("TribeTip is a tipping platform");
  });

  it("includes optional social profiles in sameAs when configured", () => {
    process.env.NEXT_PUBLIC_SOCIAL_X_URL = "https://x.com/tribetip";

    expect(organizationSameAs()).toEqual(["https://x.com/tribetip"]);
  });
});

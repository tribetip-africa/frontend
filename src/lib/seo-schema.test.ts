import { FAQ_CATEGORIES } from "@/lib/faq-content";
import {
  buildCreatorProfileJsonLd,
  buildFaqPageJsonLd,
  buildHomeJsonLd,
  buildWebPageJsonLd,
  faqSchemaQuestions,
} from "@/lib/seo-schema";

describe("seo schema", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
    process.env.NODE_ENV = "development";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("exports all FAQ questions with plain-text answers", () => {
    const expectedCount = FAQ_CATEGORIES.reduce((total, category) => total + category.items.length, 0);

    expect(faqSchemaQuestions()).toHaveLength(expectedCount);
    expect(faqSchemaQuestions()[0]).toMatchObject({
      question: "What is TribeTip?",
      answer: expect.stringContaining("tipping platform built for African creators"),
    });
  });

  it("builds homepage organization and website schema", () => {
    const schema = buildHomeJsonLd();

    expect(schema).toHaveLength(2);
    expect(schema[0]).toMatchObject({
      "@type": "Organization",
      name: "TribeTip",
      legalName: "TribeTip Africa",
      url: "http://localhost:3000",
      email: "support@tribetip.africa",
      areaServed: {
        "@type": "Continent",
        name: "Africa",
      },
    });
    expect(schema[1]).toMatchObject({
      "@type": "WebSite",
      name: "TribeTip",
      url: "http://localhost:3000",
      publisher: {
        "@type": "Organization",
        name: "TribeTip",
      },
    });
  });

  it("builds FAQ page schema", () => {
    const schema = buildFaqPageJsonLd();
    const firstQuestion = schema.mainEntity[0];

    expect(schema["@type"]).toBe("FAQPage");
    expect(firstQuestion).toMatchObject({
      "@type": "Question",
      "@id": "http://localhost:3000/faq#getting-started-what-is-tribetip",
      name: "What is TribeTip?",
      url: "http://localhost:3000/faq#getting-started-what-is-tribetip",
    });
    expect(firstQuestion.acceptedAnswer.text).toContain("mobile money");
  });

  it("builds creator profile schema", () => {
    const schema = buildCreatorProfileJsonLd({
      username: "ama_creates",
      display_name: "Ama Creates",
      bio: "Sharing stories from Nairobi.",
      country_code: "KE",
      currency: "KES",
    });

    expect(schema).toMatchObject({
      "@type": "ProfilePage",
      url: "http://localhost:3000/ama_creates",
      mainEntity: {
        "@type": "Person",
        name: "Ama Creates",
        alternateName: "ama_creates",
        description: "Sharing stories from Nairobi.",
        homeLocation: {
          "@type": "Place",
          name: expect.stringContaining("Kenya"),
        },
      },
    });
  });

  it("builds web page schema with optional date modified", () => {
    expect(
      buildWebPageJsonLd({
        name: "Privacy Policy",
        description: "How TribeTip handles your data.",
        path: "/privacy",
        dateModified: "June 29, 2026",
      }),
    ).toMatchObject({
      "@type": "WebPage",
      url: "http://localhost:3000/privacy",
      dateModified: "June 29, 2026",
      isPartOf: {
        "@type": "WebSite",
        name: "TribeTip",
      },
    });
  });
});

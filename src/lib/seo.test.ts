import {
  absoluteUrl,
  buildAuthPageMetadata,
  buildCreatorMetadata,
  buildCreatorMetadataFallback,
  buildHomeMetadata,
  buildPageMetadata,
  buildPrivatePageMetadata,
  getDefaultOgImage,
  getRobotsDisallowedPaths,
  getSitemapPaths,
  pageTitle,
  serializeJsonLd,
} from "@/lib/seo";

describe("seo", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_LAUNCH_MODE;
    delete process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
    process.env.NODE_ENV = "development";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("builds absolute URLs from the platform base", () => {
    expect(absoluteUrl("/faq")).toBe("http://localhost:3000/faq");
    expect(absoluteUrl("faq")).toBe("http://localhost:3000/faq");
  });

  it("formats page titles with the site name", () => {
    expect(pageTitle("FAQ — Help & answers")).toBe("FAQ — Help & answers | TribeTip");
    expect(pageTitle("TribeTip — Creator tips for Africa")).toBe("TribeTip — Creator tips for Africa");
  });

  it("includes core marketing pages in the sitemap by default", () => {
    expect(getSitemapPaths()).toEqual(["/", "/for-creators", "/faq", "/privacy", "/terms"]);
  });

  it("includes the waitlist page in sitemap when launch mode is waitlist", () => {
    process.env.NEXT_PUBLIC_LAUNCH_MODE = "waitlist";

    expect(getSitemapPaths()).toEqual([
      "/",
      "/for-creators",
      "/faq",
      "/privacy",
      "/terms",
      "/waitlist",
    ]);
  });

  it("keeps auth and private routes out of robots crawl rules", () => {
    expect(getRobotsDisallowedPaths()).toEqual([
      "/dashboard/",
      "/t/",
      "/sign-in",
      "/sign-up",
    ]);
  });

  it("builds homepage metadata with an absolute title", () => {
    expect(buildHomeMetadata()).toMatchObject({
      title: { absolute: "TribeTip — Creator tips for Africa" },
      alternates: { canonical: "/" },
      robots: { index: true, follow: true },
    });
  });

  it("builds page metadata with canonical and social tags", () => {
    const metadata = buildPageMetadata({
      title: "FAQ — Help & answers",
      description: "Answers about TribeTip.",
      path: "/faq",
    });

    expect(metadata).toMatchObject({
      title: "FAQ — Help & answers",
      description: "Answers about TribeTip.",
      alternates: { canonical: "/faq" },
      openGraph: {
        title: "FAQ — Help & answers | TribeTip",
        url: "http://localhost:3000/faq",
        siteName: "TribeTip",
        images: [getDefaultOgImage("FAQ — Help & answers | TribeTip")],
      },
      twitter: {
        card: "summary_large_image",
        title: "FAQ — Help & answers | TribeTip",
        images: ["/opengraph-image"],
      },
    });
  });

  it("builds creator metadata with canonical and currency-aware fallback copy", () => {
    const metadata = buildCreatorMetadata({
      username: "ama_creates",
      display_name: "Ama Creates",
      bio: "Sharing stories from Nairobi.",
      currency: "KES",
    });

    expect(metadata).toMatchObject({
      title: "Tip Ama Creates",
      description: "Sharing stories from Nairobi.",
      alternates: { canonical: "/ama_creates" },
      openGraph: {
        url: "http://localhost:3000/ama_creates",
        images: [{ url: "/ama_creates/opengraph-image" }],
      },
      twitter: {
        images: ["/ama_creates/opengraph-image"],
      },
    });
  });

  it("builds creator fallback metadata when profile data is unavailable", () => {
    expect(buildCreatorMetadataFallback("ama_creates")).toMatchObject({
      title: "@ama_creates",
      alternates: { canonical: "/ama_creates" },
    });
  });

  it("marks auth pages as noindex", () => {
    const metadata = buildAuthPageMetadata({
      title: "Sign in",
      description: "Sign in to TribeTip.",
      path: "/sign-in",
    });

    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    });
  });

  it("escapes < in JSON-LD to prevent script breakout", () => {
    const payload = serializeJsonLd({
      description: "</script><script>alert(1)</script>",
    });

    expect(payload).not.toContain("</script>");
    expect(payload).toContain("\\u003c/script>");
    expect(JSON.parse(payload)).toEqual({
      description: "</script><script>alert(1)</script>",
    });
  });

  it("wraps JSON-LD arrays in a single @graph object", () => {
    const payload = serializeJsonLd([
      { "@context": "https://schema.org", "@type": "Organization", name: "TribeTip" },
      { "@context": "https://schema.org", "@type": "WebSite", name: "TribeTip" },
    ]);

    expect(JSON.parse(payload)).toEqual({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", name: "TribeTip" },
        { "@type": "WebSite", name: "TribeTip" },
      ],
    });
  });

  it("marks private app pages as noindex without social metadata", () => {
    expect(
      buildPrivatePageMetadata({
        title: "Dashboard",
        path: "/dashboard",
      }),
    ).toMatchObject({
      title: "Dashboard",
      alternates: { canonical: "/dashboard" },
      robots: { index: false, follow: false },
    });
    expect(buildPrivatePageMetadata({ title: "Dashboard", path: "/dashboard" }).openGraph).toBeUndefined();
  });
});

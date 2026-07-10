import {
  auditHtmlPage,
  auditLlmsTxt,
  auditMarketingCacheHeaders,
  auditNoIndexHtml,
  auditRobotsTxt,
  auditSitemapXml,
  collectJsonLdTypes,
  extractTitle,
  parseJsonLdBlocks,
} from "@/lib/seo-audit";

const SAMPLE_HOME_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <title>TribeTip — Creator tips for Africa</title>
    <meta name="description" content="Accept tips from your supporters." />
    <meta property="og:title" content="TribeTip — Creator tips for Africa" />
    <meta property="og:description" content="Accept tips from your supporters." />
    <meta property="og:image" content="https://tribetip.africa/opengraph-image" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="canonical" href="https://tribetip.africa/" />
    <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"TribeTip"},{"@type":"WebSite","name":"TribeTip"}]}</script>
  </head>
</html>
`;

describe("seo audit", () => {
  it("extracts page title and JSON-LD types", () => {
    expect(extractTitle(SAMPLE_HOME_HTML)).toBe("TribeTip — Creator tips for Africa");
    expect(Array.from(collectJsonLdTypes(parseJsonLdBlocks(SAMPLE_HOME_HTML)))).toEqual(
      expect.arrayContaining(["Organization", "WebSite"]),
    );
  });

  it("passes a well-formed homepage audit", () => {
    const issues = auditHtmlPage({
      path: "/",
      html: SAMPLE_HOME_HTML,
      titleIncludes: ["TribeTip"],
      requiredJsonLdTypes: ["Organization", "WebSite"],
    });

    expect(issues).toEqual([]);
  });

  it("flags missing canonical and JSON-LD", () => {
    const issues = auditHtmlPage({
      path: "/broken",
      html: "<html><head><title>Broken</title></head></html>",
    });

    expect(issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        "/broken is missing a canonical link.",
        "/broken is missing meta description.",
        "/broken has no JSON-LD blocks.",
      ]),
    );
  });

  it("audits robots, sitemap, and llms surfaces", () => {
    const robots = ["User-agent: *", "Disallow: /dashboard/", "Disallow: /sign-in", "Sitemap: https://tribetip.africa/sitemap.xml"].join("\n");
    const sitemap = `<?xml version="1.0"?><urlset><url><loc>https://tribetip.africa/for-creators</loc></url></urlset>`;
    const llms = "# TribeTip\nTribeTip is a tipping platform\n/for-creators\n/faq";

    expect(auditRobotsTxt(robots)).toEqual([]);
    expect(auditSitemapXml(sitemap, ["/for-creators"])).toEqual([]);
    expect(auditLlmsTxt(llms)).toEqual([]);
  });

  it("flags pages that should stay out of the index", () => {
    const privateHtml = `
      <html><head>
        <meta name="robots" content="noindex, nofollow" />
      </head></html>
    `;

    expect(auditNoIndexHtml(privateHtml, "/sign-in")).toEqual([]);
    expect(auditNoIndexHtml("<html></html>", "/dashboard").length).toBe(1);
  });

  it("warns when marketing pages lack static cache policy", () => {
    const issues = auditMarketingCacheHeaders("/", {
      get: () => "noStore",
    });

    expect(issues[0]?.message).toContain("staticPage");
  });
});

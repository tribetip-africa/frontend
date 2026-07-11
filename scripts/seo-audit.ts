import {
  auditHtmlPage,
  auditLlmsTxt,
  auditMarketingCacheHeaders,
  auditNoIndexHtml,
  auditRobotsTxt,
  auditSitemapXml,
  fetchAuditResponse,
  formatAuditReport,
  hasAuditErrors,
  type SeoAuditIssue,
} from "@/lib/seo-audit";

const BASE_URL = (process.env.SEO_AUDIT_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

const HTML_PAGES = [
  {
    path: "/",
    titleIncludes: ["TribeTip"],
    requiredJsonLdTypes: ["Organization", "WebSite"],
  },
  {
    path: "/for-creators",
    titleIncludes: ["creators", "TribeTip"],
    requiredJsonLdTypes: ["WebPage", "BreadcrumbList"],
  },
  {
    path: "/faq",
    titleIncludes: ["FAQ", "TribeTip"],
    requiredJsonLdTypes: ["FAQPage"],
  },
  {
    path: "/privacy",
    titleIncludes: ["Privacy", "TribeTip"],
    requiredJsonLdTypes: ["WebPage"],
  },
  {
    path: "/terms",
    titleIncludes: ["Terms", "TribeTip"],
    requiredJsonLdTypes: ["WebPage"],
  },
] as const;

async function authRoutesAreOpen(baseUrl: string): Promise<boolean> {
  const response = await fetch(`${baseUrl}/sign-in`, { redirect: "manual" });
  return response.status === 200;
}

async function privateAuditPaths(baseUrl: string): Promise<string[]> {
  const paths = ["/dashboard"];
  if (await authRoutesAreOpen(baseUrl)) {
    paths.unshift("/sign-in", "/sign-up");
  }
  return paths;
}

async function fetchText(path: string): Promise<string> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: "text/html,application/xml,text/plain,*/*" },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  return response.text();
}

async function runSeoAudit(): Promise<SeoAuditIssue[]> {
  const issues: SeoAuditIssue[] = [];

  issues.push(...auditRobotsTxt(await fetchText("/robots.txt")));
  issues.push(
    ...auditSitemapXml(await fetchText("/sitemap.xml"), [
      "/",
      "/for-creators",
      "/faq",
      "/privacy",
      "/terms",
    ]),
  );
  issues.push(...auditLlmsTxt(await fetchText("/llms.txt")));

  for (const page of HTML_PAGES) {
    const { html, headers } = await fetchAuditResponse(BASE_URL, page.path);
    issues.push(...auditMarketingCacheHeaders(page.path, headers));
    issues.push(
      ...auditHtmlPage({
        path: page.path,
        html,
        titleIncludes: [...page.titleIncludes],
        requiredJsonLdTypes: [...page.requiredJsonLdTypes],
      }),
    );
  }

  for (const path of await privateAuditPaths(BASE_URL)) {
    const { html } = await fetchAuditResponse(BASE_URL, path);
    issues.push(...auditNoIndexHtml(html, path));
  }

  return issues;
}

async function main() {
  console.log(`Running SEO audit against ${BASE_URL}…`);

  const issues = await runSeoAudit();

  if (issues.length > 0) {
    console.error(formatAuditReport(issues));
  } else {
    console.log(formatAuditReport(issues));
  }

  if (hasAuditErrors(issues)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("SEO audit failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

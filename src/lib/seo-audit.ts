export type SeoAuditLevel = "error" | "warn";

export type SeoAuditIssue = {
  level: SeoAuditLevel;
  message: string;
};

export type HtmlPageAuditInput = {
  path: string;
  html: string;
  requiredJsonLdTypes?: string[];
  titleIncludes?: string[];
};

const JSON_LD_PATTERN =
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

export function extractMetaTags(html: string): Map<string, string> {
  const tags = new Map<string, string>();
  const patterns = [
    /<meta\s+[^>]*(?:name|property)=["']([^"']+)["'][^>]*content=["']([^"']*)["'][^>]*>/gi,
    /<meta\s+[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']([^"']+)["'][^>]*>/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      if (pattern === patterns[1]) {
        tags.set(match[2], decodeHtmlEntities(match[1]));
      } else {
        tags.set(match[1], decodeHtmlEntities(match[2]));
      }
    }
    pattern.lastIndex = 0;
  }

  return tags;
}

export function extractLinkTags(html: string): Map<string, string> {
  const tags = new Map<string, string>();
  const patterns = [
    /<link\s+[^>]*rel=["']([^"']+)["'][^>]*href=["']([^"']*)["'][^>]*>/gi,
    /<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']([^"']+)["'][^>]*>/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      if (pattern === patterns[1]) {
        tags.set(match[2], decodeHtmlEntities(match[1]));
      } else {
        tags.set(match[1], decodeHtmlEntities(match[2]));
      }
    }
    pattern.lastIndex = 0;
  }

  return tags;
}

export function parseJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  let match: RegExpExecArray | null;

  while ((match = JSON_LD_PATTERN.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(match[1]));
    } catch {
      blocks.push({ __parseError: true });
    }
  }

  JSON_LD_PATTERN.lastIndex = 0;
  return blocks;
}

export function collectJsonLdTypes(value: unknown, types: Set<string> = new Set()): Set<string> {
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectJsonLdTypes(entry, types);
    }
    return types;
  }

  if (!value || typeof value !== "object") {
    return types;
  }

  const record = value as Record<string, unknown>;
  const typeValue = record["@type"];

  if (typeof typeValue === "string") {
    types.add(typeValue);
  } else if (Array.isArray(typeValue)) {
    for (const entry of typeValue) {
      if (typeof entry === "string") types.add(entry);
    }
  }

  for (const nested of Object.values(record)) {
    collectJsonLdTypes(nested, types);
  }

  return types;
}

export function auditHtmlPage(input: HtmlPageAuditInput): SeoAuditIssue[] {
  const issues: SeoAuditIssue[] = [];
  const title = extractTitle(input.html);
  const meta = extractMetaTags(input.html);
  const links = extractLinkTags(input.html);
  const jsonLdBlocks = parseJsonLdBlocks(input.html);
  const jsonLdTypes = collectJsonLdTypes(jsonLdBlocks);

  if (!title) {
    issues.push({ level: "error", message: `${input.path} is missing a <title> tag.` });
  } else if (input.titleIncludes?.length) {
    const matches = input.titleIncludes.some((fragment) =>
      title.toLowerCase().includes(fragment.toLowerCase()),
    );
    if (!matches) {
      issues.push({
        level: "error",
        message: `${input.path} title "${title}" did not match ${input.titleIncludes.join(", ")}.`,
      });
    }
  }

  if (!links.has("canonical")) {
    issues.push({ level: "error", message: `${input.path} is missing a canonical link.` });
  }

  for (const key of ["description", "og:title", "og:description", "og:image", "twitter:card"]) {
    if (!meta.has(key)) {
      issues.push({ level: "error", message: `${input.path} is missing meta ${key}.` });
    }
  }

  if (jsonLdBlocks.length === 0) {
    issues.push({ level: "error", message: `${input.path} has no JSON-LD blocks.` });
  }

  if (jsonLdBlocks.some((block) => block && typeof block === "object" && "__parseError" in block)) {
    issues.push({ level: "error", message: `${input.path} has invalid JSON-LD JSON.` });
  }

  for (const type of input.requiredJsonLdTypes ?? []) {
    if (!jsonLdTypes.has(type)) {
      issues.push({
        level: "error",
        message: `${input.path} is missing JSON-LD type ${type}.`,
      });
    }
  }

  return issues;
}

export function auditRobotsTxt(content: string): SeoAuditIssue[] {
  const issues: SeoAuditIssue[] = [];
  const normalized = content.toLowerCase();

  if (!normalized.includes("user-agent:")) {
    issues.push({ level: "error", message: "robots.txt is missing User-agent." });
  }
  if (!normalized.includes("sitemap:")) {
    issues.push({ level: "error", message: "robots.txt is missing Sitemap." });
  }
  if (!normalized.includes("disallow: /dashboard/")) {
    issues.push({ level: "error", message: "robots.txt must disallow /dashboard/." });
  }
  if (!normalized.includes("disallow: /sign-in")) {
    issues.push({ level: "error", message: "robots.txt must disallow /sign-in." });
  }

  return issues;
}

export function auditSitemapXml(content: string, requiredPaths: string[]): SeoAuditIssue[] {
  const issues: SeoAuditIssue[] = [];

  if (!content.includes("<urlset")) {
    issues.push({ level: "error", message: "sitemap.xml is not a valid urlset document." });
  }

  for (const path of requiredPaths) {
    if (!content.includes(path)) {
      issues.push({ level: "error", message: `sitemap.xml is missing ${path}.` });
    }
  }

  return issues;
}

export function auditLlmsTxt(content: string): SeoAuditIssue[] {
  const issues: SeoAuditIssue[] = [];

  if (!content.includes("# TribeTip")) {
    issues.push({ level: "error", message: "llms.txt is missing the TribeTip heading." });
  }
  if (!content.includes("TribeTip is a tipping platform")) {
    issues.push({ level: "error", message: "llms.txt is missing the core product definition." });
  }
  if (!content.includes("/for-creators")) {
    issues.push({ level: "error", message: "llms.txt is missing the for-creators page link." });
  }
  if (!content.includes("/faq")) {
    issues.push({ level: "error", message: "llms.txt is missing the FAQ page link." });
  }

  return issues;
}

export function auditNoIndexHtml(html: string, path: string): SeoAuditIssue[] {
  const meta = extractMetaTags(html);
  const robots = meta.get("robots")?.toLowerCase() ?? "";
  const googlebot = meta.get("googlebot")?.toLowerCase() ?? "";

  if (robots.includes("noindex") || googlebot.includes("noindex")) {
    return [];
  }

  return [{ level: "error", message: `${path} should include robots noindex metadata.` }];
}

export function auditMarketingCacheHeaders(
  path: string,
  headers: Pick<Headers, "get">,
): SeoAuditIssue[] {
  if (path !== "/" && path !== "/for-creators" && path !== "/faq") {
    return [];
  }

  const policy = headers.get("x-cache-policy");
  if (policy !== "staticPage") {
    return [
      {
        level: "warn",
        message: `${path} expected X-Cache-Policy staticPage, got ${policy ?? "none"}.`,
      },
    ];
  }

  return [];
}

export async function fetchAuditResponse(
  baseUrl: string,
  path: string,
): Promise<{ html: string; headers: Headers }> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: "text/html,application/xhtml+xml" },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  return {
    html: await response.text(),
    headers: response.headers,
  };
}

export function formatAuditReport(issues: SeoAuditIssue[]): string {
  if (issues.length === 0) {
    return "SEO audit passed.";
  }

  return issues.map((issue) => `${issue.level.toUpperCase()}: ${issue.message}`).join("\n");
}

export function hasAuditErrors(issues: SeoAuditIssue[]): boolean {
  return issues.some((issue) => issue.level === "error");
}

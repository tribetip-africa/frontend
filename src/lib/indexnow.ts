import { absoluteUrl, getSitemapPaths } from "@/lib/seo";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key || null;
}

export function indexNowKeyLocation(key: string): string {
  return absoluteUrl(`/${key}.txt`);
}

export function defaultIndexNowUrls(): string[] {
  return getSitemapPaths().map((path) => absoluteUrl(path));
}

export async function submitIndexNowUrls(urls: string[]): Promise<Response> {
  const key = getIndexNowKey();
  if (!key) {
    throw new Error("INDEXNOW_KEY is not configured.");
  }

  const host = new URL(absoluteUrl("/")).host;
  const uniqueUrls = Array.from(new Set(urls.map((url) => url.trim()).filter(Boolean)));

  if (uniqueUrls.length === 0) {
    throw new Error("At least one URL is required for IndexNow submission.");
  }

  return fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation: indexNowKeyLocation(key),
      urlList: uniqueUrls,
    }),
    cache: "no-store",
  });
}

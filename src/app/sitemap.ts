import type { MetadataRoute } from "next";
import { absoluteUrl, getSitemapPaths } from "@/lib/seo";
import { fetchAllSitemapCreators } from "@/lib/sitemap-creators";

function staticSitemapEntries(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return getSitemapPaths().map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/faq" || path === "/for-creators" ? 0.8 : 0.5,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticSitemapEntries();

  try {
    const creators = await fetchAllSitemapCreators();

    const creatorEntries: MetadataRoute.Sitemap = creators.map((creator) => ({
      url: absoluteUrl(`/${creator.username}`),
      lastModified: new Date(creator.updated_at),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticEntries, ...creatorEntries];
  } catch {
    return staticEntries;
  }
}

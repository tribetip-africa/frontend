import type { MetadataRoute } from "next";
import { absoluteUrl, getRobotsDisallowedPaths } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: getRobotsDisallowedPaths(),
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

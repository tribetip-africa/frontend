export const CACHE_POLICIES = {
  /** Auth, dashboard, tokens — never cache anywhere. */
  noStore: {
    fetchCache: "no-store" as RequestCache,
    revalidate: 0,
  },
  /** Public creator pages — short CDN/browser TTL. */
  publicShort: {
    fetchCache: "default" as RequestCache,
    revalidate: 60,
  },
  /** Marketing/landing pages — longer edge cache, still no private data. */
  staticPage: {
    fetchCache: "force-cache" as RequestCache,
    revalidate: 300,
  },
} as const;

export type CachePolicyName = keyof typeof CACHE_POLICIES;

const SENSITIVE_PATH_FRAGMENTS = [
  "/tribes/sign_in",
  "/tribes/sign_out",
  "/tribes.json",
  "/dashboard",
  "/sign-in",
  "/sign-up",
] as const;

export function inferCachePolicy(pathname: string, hasAuthHeader = false): CachePolicyName {
  if (hasAuthHeader) return "noStore";
  if (SENSITIVE_PATH_FRAGMENTS.some((fragment) => pathname.includes(fragment))) {
    return "noStore";
  }
  if (pathname.match(/^\/tribes\/[a-z0-9_]+$/)) return "publicShort";
  if (pathname.match(/^\/api\/tribes\/[a-z0-9_]+$/)) return "publicShort";
  if (pathname.match(/^\/share\/[A-Za-z0-9_-]{20,48}$/)) return "publicShort";
  if (pathname === "/") return "staticPage";
  return "noStore";
}

export function cacheControlHeader(policy: CachePolicyName): string {
  switch (policy) {
    case "noStore":
      return "no-store, no-cache, must-revalidate, max-age=0, private";
    case "publicShort":
      return "public, max-age=60, stale-while-revalidate=30";
    case "staticPage":
      return "public, max-age=300, stale-while-revalidate=60";
    default:
      return "no-store, no-cache, must-revalidate, max-age=0, private";
  }
}

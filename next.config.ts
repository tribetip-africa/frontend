import type { NextConfig } from "next";
import { buildContentSecurityPolicy, buildEmbeddableContentSecurityPolicy, cspHeaderName } from "./src/lib/csp";
import { RESERVED_ROOT_SEGMENTS } from "./src/lib/public-tip-path";

// Single source of truth: the embeddable creator-page header rule must never
// match a reserved app route (e.g. /faq, /terms, /dashboard). Deriving the
// exclusion list from RESERVED_ROOT_SEGMENTS keeps this in sync with middleware.
function reservedSegmentsAlternation(): string {
  return Array.from(RESERVED_ROOT_SEGMENTS)
    .map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
}

const embeddableUsernameSource = `/:username((?!${reservedSegmentsAlternation()})[a-z0-9_]+)`;

const sharedSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const lockedSecurityHeaders = [
  { key: cspHeaderName(), value: buildContentSecurityPolicy() },
  ...sharedSecurityHeaders,
];

const embeddableSecurityHeaders = [
  { key: cspHeaderName(), value: buildEmbeddableContentSecurityPolicy() },
  ...sharedSecurityHeaders,
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: import.meta.dirname,
  },
  async redirects() {
    return [
      { source: "/onboarding", destination: "/dashboard", permanent: false },
      { source: "/admin", destination: "/dashboard", permanent: false },
      { source: "/admin/:path*", destination: "/dashboard", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/llms.txt", destination: "/api/llms" },
      { source: "/:key.txt", destination: "/api/indexnow/key?key=:key" },
    ];
  },
  async headers() {
    return [
      {
        source: "/t/:path*",
        headers: embeddableSecurityHeaders,
      },
      {
        // Public creator pages — embeddable (frame-ancestors *), no X-Frame-Options.
        source: embeddableUsernameSource,
        headers: embeddableSecurityHeaders,
      },
      {
        source: "/((?!t/).*)",
        headers: lockedSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import { buildContentSecurityPolicy, buildEmbeddableContentSecurityPolicy, cspHeaderName } from "./src/lib/csp";

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
  async headers() {
    return [
      {
        source: "/t/:path*",
        headers: embeddableSecurityHeaders,
      },
      {
        // Public creator pages — embeddable (frame-ancestors *), no X-Frame-Options.
        source: "/:username((?!dashboard|sign-in|sign-up|t|api|_next|favicon\\.ico|robots\\.txt|sitemap\\.xml)[a-z0-9_]+)",
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

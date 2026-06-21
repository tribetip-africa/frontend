function apiConnectOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "http://localhost:3001";
  }
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function buildPolicyDirectives(frameAncestors: string): string[] {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    frameAncestors,
    `connect-src 'self' ${apiConnectOrigin()}`,
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    isProduction()
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "object-src 'none'",
  ];

  if (isProduction()) {
    directives.push("upgrade-insecure-requests");
  }

  return directives;
}

export function buildContentSecurityPolicy(): string {
  return buildPolicyDirectives("frame-ancestors 'none'").join("; ");
}

export function buildEmbeddableContentSecurityPolicy(): string {
  return buildPolicyDirectives("frame-ancestors *").join("; ");
}

export function cspHeaderName(): string {
  return "Content-Security-Policy";
}

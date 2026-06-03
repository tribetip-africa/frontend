function apiConnectOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "http://localhost:3001";
  }
}

export function buildContentSecurityPolicy(): string {
  const connectSrc = ["'self'", apiConnectOrigin()].join(" ");

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    `connect-src ${connectSrc}`,
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function cspHeaderName(): string {
  return process.env.NODE_ENV === "production"
    ? "Content-Security-Policy"
    : "Content-Security-Policy-Report-Only";
}

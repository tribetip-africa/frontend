export type ContentSecurityPolicyOptions = {
  embeddable?: boolean;
  nonce?: string;
};

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

function buildScriptSrc(nonce?: string): string {
  if (!isProduction()) {
    return "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  }

  if (nonce) {
    return `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;
  }

  return "script-src 'self' 'unsafe-inline'";
}

function buildPolicyDirectives(options: ContentSecurityPolicyOptions = {}): string[] {
  const frameAncestors = options.embeddable ? "frame-ancestors *" : "frame-ancestors 'none'";
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    frameAncestors,
    `connect-src 'self' ${apiConnectOrigin()}`,
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    buildScriptSrc(options.nonce),
    "object-src 'none'",
  ];

  if (isProduction()) {
    directives.push("upgrade-insecure-requests");
  }

  return directives;
}

export function buildContentSecurityPolicy(options: ContentSecurityPolicyOptions = {}): string {
  return buildPolicyDirectives(options).join("; ");
}

export function buildEmbeddableContentSecurityPolicy(options: Omit<ContentSecurityPolicyOptions, "embeddable"> = {}): string {
  return buildPolicyDirectives({ ...options, embeddable: true }).join("; ");
}

export function cspHeaderName(): string {
  return "Content-Security-Policy";
}

export function generateCspNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

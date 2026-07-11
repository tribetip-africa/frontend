import {
  buildContentSecurityPolicy,
  buildEmbeddableContentSecurityPolicy,
  cspHeaderName,
  generateCspNonce,
} from "@/lib/csp";

describe("CSP", () => {
  it("includes API origin in connect-src", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
    expect(buildContentSecurityPolicy()).toContain("connect-src 'self' http://localhost:3001");
  });

  it("blocks framing and object embeds", () => {
    const policy = buildContentSecurityPolicy();
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
  });

  it("allows widget embeds on public tip pages", () => {
    const policy = buildEmbeddableContentSecurityPolicy();
    expect(policy).toContain("frame-ancestors *");
    expect(policy).toContain("object-src 'none'");
  });

  it("uses enforcing CSP in all environments", () => {
    expect(cspHeaderName()).toBe("Content-Security-Policy");
  });

  it("only upgrades insecure requests in production", () => {
    const previous = process.env.NODE_ENV;

    process.env.NODE_ENV = "development";
    expect(buildContentSecurityPolicy()).not.toContain("upgrade-insecure-requests");

    process.env.NODE_ENV = "production";
    expect(buildContentSecurityPolicy()).toContain("upgrade-insecure-requests");

    process.env.NODE_ENV = previous;
  });

  it("allows unsafe-eval for React dev tooling in development only", () => {
    const previous = process.env.NODE_ENV;

    process.env.NODE_ENV = "development";
    expect(buildContentSecurityPolicy()).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    expect(buildEmbeddableContentSecurityPolicy()).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");

    process.env.NODE_ENV = "production";
    expect(buildContentSecurityPolicy()).toContain("script-src 'self' 'unsafe-inline'");
    expect(buildContentSecurityPolicy()).not.toContain("unsafe-eval");
    expect(buildEmbeddableContentSecurityPolicy()).not.toContain("unsafe-eval");

    process.env.NODE_ENV = previous;
  });

  it("uses nonce and strict-dynamic in production when a nonce is provided", () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const policy = buildContentSecurityPolicy({ nonce: "abc123" });
    expect(policy).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(policy).not.toMatch(/script-src[^;]*unsafe-inline/);

    process.env.NODE_ENV = previous;
  });

  it("generates a base64 nonce", () => {
    expect(generateCspNonce()).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

import { buildContentSecurityPolicy, cspHeaderName } from "@/lib/csp";

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

  it("uses report-only in development", () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    expect(cspHeaderName()).toBe("Content-Security-Policy-Report-Only");
    process.env.NODE_ENV = previous;
  });

  it("enforces CSP in production", () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    expect(cspHeaderName()).toBe("Content-Security-Policy");
    process.env.NODE_ENV = previous;
  });
});

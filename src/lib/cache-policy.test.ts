import { cacheControlHeader, inferCachePolicy } from "@/lib/cache-policy";

describe("cache policy", () => {
  it("never caches auth routes", () => {
    expect(inferCachePolicy("/sign-in")).toBe("noStore");
    expect(inferCachePolicy("/sign-up")).toBe("noStore");
    expect(inferCachePolicy("/dashboard")).toBe("noStore");
    expect(inferCachePolicy("/tribes/sign_in.json")).toBe("noStore");
    expect(inferCachePolicy("/tribes/demo", true)).toBe("noStore");
  });

  it("allows short public cache for creator and share pages", () => {
    expect(inferCachePolicy("/tribes/ama_creates")).toBe("publicShort");
    expect(inferCachePolicy("/share/AAPb-WAjm626YAtTRbA05cc0TAgJMbvO")).toBe("publicShort");
    expect(cacheControlHeader("publicShort")).toContain("public");
    expect(cacheControlHeader("publicShort")).toContain("max-age=60");
  });

  it("uses static cache for landing page only", () => {
    expect(inferCachePolicy("/")).toBe("staticPage");
    expect(cacheControlHeader("staticPage")).toContain("max-age=300");
    expect(cacheControlHeader("noStore")).toContain("no-store");
  });

  it("defaults unknown routes to no-store", () => {
    expect(inferCachePolicy("/unknown-route")).toBe("noStore");
  });
});

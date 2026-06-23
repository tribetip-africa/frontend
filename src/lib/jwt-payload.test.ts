import { decodeJwtPayload, getTokenExpiryMs, isTokenExpired } from "@/lib/jwt-payload";

function encodePayload(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe("jwt payload helpers", () => {
  it("decodes exp and sub claims", () => {
    const token = encodePayload({ sub: "tribe-id", exp: 1_700_000_000 });
    expect(decodeJwtPayload(token)).toEqual({ sub: "tribe-id", exp: 1_700_000_000 });
  });

  it("detects expired tokens", () => {
    const token = encodePayload({ exp: 1 });
    expect(isTokenExpired(token, 2_000)).toBe(true);
    expect(getTokenExpiryMs(token)).toBe(1_000);
  });
});

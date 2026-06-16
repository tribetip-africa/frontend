import {
  getSharePagePath,
  getSharePageUrl,
  isValidShareToken,
  shareLinkHint,
} from "@/lib/share-link";

describe("share-link helpers", () => {
  it("builds opaque share paths and urls", () => {
    const token = "AAPb-WAjm626YAtTRbA05cc0TAgJMbvO";
    expect(getSharePagePath(token)).toBe(`/t/${token}`);
    expect(getSharePageUrl(token)).toContain(`/t/${token}`);
    expect(getSharePageUrl(token)).not.toContain("username");
  });

  it("validates share token format", () => {
    expect(isValidShareToken("AAPb-WAjm626YAtTRbA05cc0TAgJMbvO")).toBe(true);
    expect(isValidShareToken("short")).toBe(false);
    expect(isValidShareToken("has spaces in token")).toBe(false);
  });

  it("describes locked vs shareable states", () => {
    expect(shareLinkHint(false)).toMatch(/publish/i);
    expect(shareLinkHint(true)).toMatch(/scan/i);
  });
});

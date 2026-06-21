import {
  isBlockedPublicUsernamePath,
  isEmbeddablePublicTipPath,
  isValidPublicUsername,
} from "@/lib/public-tip-path";

describe("public-tip-path", () => {
  describe("isValidPublicUsername", () => {
    it("accepts API-aligned usernames", () => {
      expect(isValidPublicUsername("demo_creator")).toBe(true);
      expect(isValidPublicUsername("user123")).toBe(true);
    });

    it("rejects dotfiles and path-like segments", () => {
      expect(isValidPublicUsername(".env")).toBe(false);
      expect(isValidPublicUsername(".env.local")).toBe(false);
      expect(isValidPublicUsername("package.json")).toBe(false);
    });
  });

  describe("isEmbeddablePublicTipPath", () => {
    it("matches share links and valid creator pages", () => {
      expect(isEmbeddablePublicTipPath("/t/abc1234567890123456789012")).toBe(true);
      expect(isEmbeddablePublicTipPath("/demo_creator")).toBe(true);
    });

    it("ignores reserved and invalid single-segment paths", () => {
      expect(isEmbeddablePublicTipPath("/dashboard")).toBe(false);
      expect(isEmbeddablePublicTipPath("/.env")).toBe(false);
      expect(isEmbeddablePublicTipPath("/package.json")).toBe(false);
    });
  });

  describe("isBlockedPublicUsernamePath", () => {
    it("flags invalid single-segment paths that would hit [username]", () => {
      expect(isBlockedPublicUsernamePath("/.env")).toBe(true);
      expect(isBlockedPublicUsernamePath("/package.json")).toBe(true);
    });

    it("ignores reserved app routes and valid usernames", () => {
      expect(isBlockedPublicUsernamePath("/dashboard")).toBe(false);
      expect(isBlockedPublicUsernamePath("/demo_creator")).toBe(false);
      expect(isBlockedPublicUsernamePath("/t/token")).toBe(false);
    });
  });
});

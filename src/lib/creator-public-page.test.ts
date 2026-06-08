import {
  canAccessCreatorPublicPage,
  isPublicPageShareable,
  maskPublicPageDisplayUrl,
  publicPageDisplayUrl,
} from "@/lib/creator-public-page";

describe("creator public page helpers", () => {
  it("requires publish and payout verification before sharing", () => {
    expect(
      isPublicPageShareable({
        is_profile_public: true,
        paystack_onboarding: { subaccount_verified: true },
      } as never),
    ).toBe(true);

    expect(
      isPublicPageShareable({
        is_profile_public: false,
        paystack_onboarding: { subaccount_verified: true },
      } as never),
    ).toBe(false);

    expect(
      isPublicPageShareable({
        is_profile_public: true,
        paystack_onboarding: { subaccount_verified: false },
      } as never),
    ).toBe(false);
  });

  it("masks the public url until shareable", () => {
    expect(maskPublicPageDisplayUrl("creator")).not.toContain("creator");
    expect(publicPageDisplayUrl("creator", false)).not.toContain("creator");
    expect(publicPageDisplayUrl("creator", true)).toContain("creator");
  });

  it("blocks admins from public page access", () => {
    expect(
      canAccessCreatorPublicPage(
        { role: "admin" },
        { is_profile_public: true, paystack_onboarding: { subaccount_verified: true } } as never,
      ),
    ).toBe(false);
  });
});

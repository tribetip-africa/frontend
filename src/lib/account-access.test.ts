import { accountStatusBanner, isForbiddenError } from "@/lib/account-access";
import { TribetipApiError } from "@/lib/errors";

describe("account access helpers", () => {
  it("returns pending banner copy", () => {
    expect(accountStatusBanner({ account_status: "pending" })?.message).toMatch(/pending/i);
  });

  it("returns suspended banner copy", () => {
    expect(accountStatusBanner({ account_status: "suspended" })?.tone).toBe("danger");
  });

  it("returns null for active accounts", () => {
    expect(accountStatusBanner({ account_status: "active" })).toBeNull();
  });

  it("detects forbidden API errors", () => {
    const error = new TribetipApiError(403, { error: { code: "forbidden", message: "Nope" } });
    expect(isForbiddenError(error)).toBe(true);
  });
});

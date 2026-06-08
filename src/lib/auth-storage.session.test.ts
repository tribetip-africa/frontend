import { TribetipApiError, parseApiErrorBody } from "@/lib/errors";

jest.mock("./api", () => ({
  fetchMyProfile: jest.fn(),
}));

import { fetchMyProfile } from "./api";
import { validateStoredSession } from "./auth-session";

const fetchMyProfileMock = fetchMyProfile as jest.MockedFunction<typeof fetchMyProfile>;

describe("validateStoredSession", () => {
  beforeEach(() => {
    fetchMyProfileMock.mockReset();
  });

  it("treats onboarding_required as a valid session pending payout setup", async () => {
    fetchMyProfileMock.mockRejectedValue(
      parseApiErrorBody(403, {
        error: {
          code: "onboarding_required",
          message: "Complete Paystack setup before accessing the dashboard.",
        },
      }),
    );

    await expect(validateStoredSession("token")).resolves.toBeNull();
  });

  it("rethrows invalid sessions", async () => {
    fetchMyProfileMock.mockRejectedValue(new TribetipApiError(401, { error: "Unauthorized" }));

    await expect(validateStoredSession("token")).rejects.toMatchObject({ status: 401 });
  });
});

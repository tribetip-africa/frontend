import { TribetipApiError } from "@/lib/errors";

const secureFetchMock = jest.fn();

jest.mock("./secure-fetch", () => ({
  secureFetch: (...args: unknown[]) => secureFetchMock(...args),
}));

jest.mock("./platform", () => ({
  getApiBaseUrl: () => "http://127.0.0.1:3001",
}));

import { completePaystackOnboarding, fetchPaystackOnboarding } from "@/lib/api";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const tribe = {
  id: "1",
  email: "creator@tribetip.africa",
  username: "creator",
  role: "creator" as const,
  account_status: "active" as const,
  paystack_onboarding: {
    customer_ready: true,
    subaccount_ready: true,
    complete: true,
  },
};

describe("Paystack onboarding API", () => {
  beforeEach(() => {
    secureFetchMock.mockReset();
  });

  it("fetches onboarding status with market and banks", async () => {
    secureFetchMock.mockResolvedValue(
      jsonResponse({
        onboarding: {
          customer_ready: true,
          subaccount_ready: false,
          complete: false,
        },
        market: {
          country_code: "KE",
          name: "Kenya",
          currency: "KES",
          paystack_bank_country: "kenya",
          subaccount_supported: true,
        },
        banks: [{ name: "KCB Bank", code: "68" }],
      }),
    );

    const payload = await fetchPaystackOnboarding("token");

    expect(payload.market.country_code).toBe("KE");
    expect(payload.banks[0]?.code).toBe("68");
    expect(secureFetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3001/me/paystack/onboarding",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token",
        }),
      }),
    );
  });

  it("submits bank details to complete onboarding", async () => {
    secureFetchMock.mockResolvedValue(
      jsonResponse({
        onboarding: tribe.paystack_onboarding,
        tribe,
        market: {
          country_code: "KE",
          name: "Kenya",
          currency: "KES",
          paystack_bank_country: "kenya",
          subaccount_supported: true,
        },
        banks: [],
      }),
    );

    const result = await completePaystackOnboarding("token", {
      settlement_bank: "68",
      account_number: "0123456789",
      business_name: "Creator",
    });

    expect(result.tribe.paystack_onboarding.complete).toBe(true);
    expect(result.market.country_code).toBe("KE");
    expect(secureFetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3001/me/paystack/onboarding",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token",
          "Idempotency-Key": expect.any(String),
        }),
        body: JSON.stringify({
          onboarding: {
            settlement_bank: "68",
            account_number: "0123456789",
            business_name: "Creator",
          },
        }),
      }),
    );
  });

  it("throws TribetipApiError when onboarding submission fails", async () => {
    secureFetchMock.mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: "bad_request",
            message: "Unable to create Paystack subaccount.",
          },
        },
        400,
      ),
    );

    await expect(
      completePaystackOnboarding("token", {
        settlement_bank: "057",
        account_number: "0123456789",
      }),
    ).rejects.toBeInstanceOf(TribetipApiError);
  });
});

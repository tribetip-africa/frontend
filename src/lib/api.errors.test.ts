import { TribetipApiError, TribetipAuthError, TribetipNetworkError } from "@/lib/errors";

const secureFetchMock = jest.fn();

jest.mock("./secure-fetch", () => ({
  secureFetch: (...args: unknown[]) => secureFetchMock(...args),
}));

jest.mock("./platform", () => ({
  getApiBaseUrl: () => "http://127.0.0.1:3001",
}));

import { signIn, signUp } from "@/lib/api";

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

describe("api error handling", () => {
  beforeEach(() => {
    secureFetchMock.mockReset();
  });

  it("throws TribetipApiError for structured validation failures", async () => {
    secureFetchMock.mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: "validation_failed",
            message: "Validation failed.",
            details: { errors: ["Username is too short"] },
          },
          errors: ["Username is too short"],
        },
        422,
      ),
    );

    const promise = signUp({
      email: "test@tribetip.africa",
      password: "securepass123",
      password_confirmation: "securepass123",
      username: "ab",
    });

    await expect(promise).rejects.toBeInstanceOf(TribetipApiError);
    await expect(promise).rejects.toMatchObject({
      code: "validation_failed",
      status: 422,
    });
  });

  it("throws TribetipAuthError when sign-in succeeds without a token", async () => {
    secureFetchMock.mockResolvedValue(
      jsonResponse({
        message: "Signed in successfully.",
        tribe: { id: "1", email: "a@b.com", username: "demo" },
      }),
    );

    await expect(
      signIn({ login: "demo", password: "securepass123" }),
    ).rejects.toBeInstanceOf(TribetipAuthError);
  });

  it("throws TribetipNetworkError when fetch fails", async () => {
    secureFetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(
      signIn({ login: "demo", password: "securepass123" }),
    ).rejects.toBeInstanceOf(TribetipNetworkError);
  });

  it("returns token from Authorization header on successful sign-in", async () => {
    secureFetchMock.mockResolvedValue(
      jsonResponse(
        {
          message: "Signed in successfully.",
          tribe: { id: "1", email: "a@b.com", username: "demo" },
        },
        200,
        { Authorization: "Bearer test.jwt.token" },
      ),
    );

    const { token } = await signIn({ login: "demo", password: "securepass123" });
    expect(token).toBe("test.jwt.token");
  });
});

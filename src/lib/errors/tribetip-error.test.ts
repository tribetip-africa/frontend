import {
  TribetipApiError,
  TribetipAuthError,
  TribetipError,
  TribetipNetworkError,
  TribetipValidationError,
  isTribetipError,
} from "@/lib/errors";

describe("TribetipError hierarchy", () => {
  it("serializes the master error to JSON", () => {
    const error = new TribetipError({
      message: "Something failed",
      code: "custom",
      status: 418,
      details: { field: "email" },
      source: "function",
    });

    expect(error.toJSON()).toEqual({
      code: "custom",
      message: "Something failed",
      details: { field: "email" },
    });
  });

  it("identifies Tribetip errors with a type guard", () => {
    expect(isTribetipError(new TribetipError({ message: "x" }))).toBe(true);
    expect(isTribetipError(new Error("x"))).toBe(false);
  });

  it("assigns defaults for specialized errors", () => {
    expect(new TribetipNetworkError().code).toBe("network_error");
    expect(new TribetipAuthError().code).toBe("authentication_failed");
    expect(new TribetipValidationError().code).toBe("validation_failed");
  });

  it("maps HTTP status to API error codes", () => {
    expect(new TribetipApiError(404, {}).code).toBe("not_found");
    expect(new TribetipApiError(429, {}).code).toBe("rate_limited");
    expect(new TribetipApiError(500, {}).code).toBe("internal_error");
  });
});

import {
  TribetipApiError,
  TribetipNetworkError,
  getDisplayMessage,
  getErrorCode,
  normalizeError,
  parseApiErrorBody,
} from "@/lib/errors";

describe("parseApiErrorBody", () => {
  it("parses structured API errors", () => {
    const error = parseApiErrorBody(422, {
      error: {
        code: "validation_failed",
        message: "Validation failed.",
        details: { errors: ["Email is invalid"] },
      },
      errors: ["Email is invalid"],
    });

    expect(error).toBeInstanceOf(TribetipApiError);
    expect(error.code).toBe("validation_failed");
    expect(error.message).toBe("Validation failed.");
    expect(error.details?.errors).toEqual(["Email is invalid"]);
    expect(error.status).toBe(422);
    expect(error.source).toBe("request");
  });

  it("parses legacy string API errors", () => {
    const error = parseApiErrorBody(401, { error: "No active session." });

    expect(error.code).toBe("authentication_failed");
    expect(error.message).toBe("No active session.");
  });

  it("parses legacy validation arrays", () => {
    const error = parseApiErrorBody(422, {
      errors: ["Username is too short"],
    });

    expect(error.code).toBe("validation_failed");
    expect(error.message).toContain("Username is too short");
  });

  it("parses rate limit structured errors from the API", () => {
    const error = parseApiErrorBody(429, {
      error: {
        code: "rate_limited",
        message: "Too many requests. Please try again later.",
      },
    });

    expect(error.code).toBe("rate_limited");
    expect(error.message).toMatch(/too many requests/i);
  });
});

describe("normalizeError", () => {
  it("preserves Tribetip errors and fills missing source", () => {
    const error = new TribetipApiError(401, { error: "Nope" });
    const normalized = normalizeError(error, "request");

    expect(normalized.source).toBe("request");
    expect(normalized.code).toBe("authentication_failed");
  });

  it("wraps fetch failures as network errors", () => {
    const normalized = normalizeError(new TypeError("Failed to fetch"), "request");
    expect(normalized).toBeInstanceOf(TribetipNetworkError);
  });

  it("wraps unknown values with a friendly message", () => {
    expect(getDisplayMessage("boom")).toMatch(/something went wrong/i);
    expect(getErrorCode(new Error("Boom"))).toBe("unexpected_error");
  });
});

import { normalizeWaitlistPayload, validateWaitlistPayload } from "@/lib/waitlist";

describe("waitlist payload", () => {
  it("normalizes email and trims fields", () => {
    expect(
      normalizeWaitlistPayload({
        email: "  Creator@Example.com ",
        name: " Ama ",
        country: " ke ",
        role: "creator",
      }),
    ).toEqual({
      email: "creator@example.com",
      name: "Ama",
      country: "KE",
      role: "creator",
      source: "waitlist-page",
      website: "",
    });
  });

  it("rejects invalid email and honeypot submissions", () => {
    expect(validateWaitlistPayload({ email: "" })).toBe("Email is required.");
    expect(validateWaitlistPayload({ email: "not-an-email" })).toBe("Enter a valid email address.");
    expect(validateWaitlistPayload({ email: "ok@example.com", website: "spam" })).toBe(
      "Unable to submit right now.",
    );
  });
});

import {
  TribetipError,
  TribetipValidationError,
  getDisplayMessage,
  handleRequest,
  runSafe,
  withEventHandler,
} from "@/lib/errors";

describe("error handlers", () => {
  it("handleRequest rethrows Tribetip errors with request context", async () => {
    await expect(
      handleRequest(
        async () => {
          throw new TribetipValidationError("Bad input", { errors: ["Email is invalid"] });
        },
        { action: "signUp" },
      ),
    ).rejects.toMatchObject({
      code: "validation_failed",
      details: {
        errors: ["Email is invalid"],
        context: { action: "signUp" },
      },
    });
  });

  it("runSafe returns fallback values and reports errors", async () => {
    const reported: TribetipError[] = [];

    const result = await runSafe(
      async () => {
        throw new TribetipValidationError();
      },
      {
        fallback: null,
        onError: (error) => reported.push(error),
        context: { action: "healthCheck" },
      },
    );

    expect(result).toBeNull();
    expect(reported).toHaveLength(1);
    expect(reported[0].source).toBe("function");
    expect(getDisplayMessage(reported[0])).toMatch(/validation failed/i);
  });

  it("withEventHandler catches event handler failures", async () => {
    const reported: TribetipError[] = [];
    const handler = withEventHandler(
      async () => {
        throw new Error("submit failed");
      },
      {
        context: { form: "sign-up" },
        onError: (error) => reported.push(error),
      },
    );

    const event = new Event("submit");
    await expect(handler(event)).rejects.toMatchObject({
      source: "event",
      code: "unexpected_error",
      details: {
        context: { form: "sign-up", eventType: "submit" },
      },
    });
    expect(reported[0].details?.context).toMatchObject({
      form: "sign-up",
      eventType: "submit",
    });
  });
});

import { createIdempotencyKey } from "@/lib/idempotency-key";

describe("createIdempotencyKey", () => {
  it("returns unique non-empty keys", () => {
    const first = createIdempotencyKey();
    const second = createIdempotencyKey();

    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(first).not.toBe(second);
  });
});

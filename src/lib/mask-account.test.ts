import { maskAccountNumber } from "@/lib/mask-account";

describe("maskAccountNumber", () => {
  it("masks long account numbers", () => {
    expect(maskAccountNumber("0123456789")).toBe("•••• •••• •••• 6789");
  });

  it("handles short values", () => {
    expect(maskAccountNumber("1234")).toBe("•••• 1234");
  });

  it("returns placeholder when empty", () => {
    expect(maskAccountNumber(undefined)).toBe("•••• •••• •••• ••••");
  });
});

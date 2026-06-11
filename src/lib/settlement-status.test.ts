import { settlementStatusLabel, settlementStatusTone } from "@/lib/settlement-status";

describe("settlement status helpers", () => {
  it("labels settlement statuses for display", () => {
    expect(settlementStatusLabel("success")).toBe("Settled");
    expect(settlementStatusLabel("pending")).toBe("Pending");
  });

  it("returns tone classes for settlement badges", () => {
    expect(settlementStatusTone("success")).toMatch(/green/);
    expect(settlementStatusTone("failed")).toMatch(/red/);
  });
});

import { clearReferralCode, getReferralCode, normalizeReferralCode, setReferralCode } from "@/lib/referral-attribution";

function mockDocumentCookie() {
  let cookie = "";
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      get cookie() {
        return cookie;
      },
      set cookie(value: string) {
        cookie = value;
      },
    },
  });
}

describe("referral-attribution", () => {
  beforeEach(() => {
    mockDocumentCookie();
  });

  afterEach(() => {
    clearReferralCode();
    Reflect.deleteProperty(globalThis, "document");
  });

  it("stores and reads a username referral code with first-touch semantics", () => {
    expect(setReferralCode("Creator_One")).toBe(true);
    expect(getReferralCode()).toBe("creator_one");
    expect(setReferralCode("other_creator")).toBe(false);
    expect(getReferralCode()).toBe("creator_one");
  });

  it("accepts usernames with a leading @", () => {
    expect(normalizeReferralCode("@Creator_One")).toBe("creator_one");
    expect(setReferralCode("@creator_two")).toBe(true);
    expect(getReferralCode()).toBe("creator_two");
  });

  it("stores and reads invite token codes without lowercasing", () => {
    const token = "AbCdEfGhIjKlMnOpQrStUv";
    expect(setReferralCode(token)).toBe(true);
    expect(getReferralCode()).toBe(token);
  });

  it("rejects invalid referral codes", () => {
    expect(setReferralCode("ab")).toBe(false);
    expect(normalizeReferralCode("bad!code")).toBeNull();
    expect(getReferralCode()).toBeNull();
  });
});

import {
  getAuthStorageSnapshot,
  setStoredAuth,
  subscribeAuthStorage,
} from "@/lib/auth-storage";

const storage = new Map<string, string>();

function installBrowserMocks() {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
    },
  });

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      ...globalThis,
      localStorage: globalThis.localStorage,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  });
}

describe("auth storage paystack onboarding", () => {
  beforeEach(() => {
    storage.clear();
    installBrowserMocks();
  });

  it("stores and reads paystack onboarding status", () => {
    setStoredAuth("token", {
      id: "1",
      email: "creator@tribetip.africa",
      username: "creator",
      role: "creator",
      account_status: "active",
      paystack_onboarding: {
        customer_ready: true,
        subaccount_ready: false,
        complete: false,
      },
    });

    expect(getAuthStorageSnapshot().tribe?.paystack_onboarding).toEqual({
      customer_ready: true,
      subaccount_ready: false,
      complete: false,
      subaccount_verified: false,
    });
  });

  it("preserves payout verification in stored onboarding", () => {
    setStoredAuth("token", {
      id: "1",
      email: "creator@tribetip.africa",
      username: "creator",
      role: "creator",
      account_status: "active",
      paystack_onboarding: {
        customer_ready: true,
        subaccount_ready: true,
        complete: true,
        subaccount_verified: true,
        payout: {
          subaccount_verified: true,
        },
      },
    });

    expect(getAuthStorageSnapshot().tribe?.paystack_onboarding.subaccount_verified).toBe(true);
  });

  it("defaults missing paystack onboarding to incomplete", () => {
    localStorage.setItem("tribetip_token", "legacy-token");
    localStorage.setItem(
      "tribetip_tribe",
      JSON.stringify({
        id: "legacy",
        email: "legacy@tribetip.africa",
        username: "legacy",
        role: "creator",
        account_status: "active",
      }),
    );

    expect(getAuthStorageSnapshot().tribe?.paystack_onboarding).toEqual({
      customer_ready: false,
      subaccount_ready: false,
      complete: false,
      subaccount_verified: false,
    });
  });

  it("notifies subscribers when onboarding status changes", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeAuthStorage(listener);

    setStoredAuth("token", {
      id: "1",
      email: "creator@tribetip.africa",
      username: "creator",
      role: "creator",
      account_status: "active",
      paystack_onboarding: {
        customer_ready: true,
        subaccount_ready: true,
        complete: true,
      },
    });

    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("does not notify subscribers when stored auth is unchanged", () => {
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

    setStoredAuth("token", tribe);

    const listener = jest.fn();
    const unsubscribe = subscribeAuthStorage(listener);
    setStoredAuth("token", tribe);

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});

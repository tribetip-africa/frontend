import {
  AUTH_SESSION_COOKIE,
  clearAuthSessionCookie,
  hasAuthSessionCookie,
  setAuthSessionCookie,
} from "@/lib/auth-cookie";

const writes: string[] = [];

function installDocument(protocol: string) {
  writes.length = 0;

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      set cookie(value: string) {
        writes.push(value);
      },
      get cookie() {
        return writes.join("; ");
      },
    },
  });

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { protocol } },
  });
}

afterEach(() => {
  // @ts-expect-error cleanup test globals
  delete globalThis.document;
  // @ts-expect-error cleanup test globals
  delete globalThis.window;
});

describe("auth-cookie", () => {
  describe("hasAuthSessionCookie", () => {
    it("detects the presence flag", () => {
      expect(hasAuthSessionCookie("tribetip_session=1; other=value")).toBe(true);
      expect(hasAuthSessionCookie("other=value")).toBe(false);
      expect(hasAuthSessionCookie(null)).toBe(false);
    });
  });

  describe("setAuthSessionCookie", () => {
    it("adds the Secure attribute over HTTPS", () => {
      installDocument("https:");
      setAuthSessionCookie();

      expect(writes[0]).toContain(`${AUTH_SESSION_COOKIE}=1`);
      expect(writes[0]).toContain("samesite=lax");
      expect(writes[0]).toContain("; secure");
    });

    it("omits Secure over plaintext HTTP (e.g. local dev)", () => {
      installDocument("http:");
      setAuthSessionCookie();

      expect(writes[0]).toContain(`${AUTH_SESSION_COOKIE}=1`);
      expect(writes[0]).not.toContain("secure");
    });
  });

  describe("clearAuthSessionCookie", () => {
    it("expires the cookie and keeps Secure over HTTPS", () => {
      installDocument("https:");
      clearAuthSessionCookie();

      expect(writes[0]).toContain(`${AUTH_SESSION_COOKIE}=;`);
      expect(writes[0]).toContain("max-age=0");
      expect(writes[0]).toContain("; secure");
    });
  });
});

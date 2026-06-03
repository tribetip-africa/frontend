import {
  PLATFORM_DEFAULTS,
  getApiBaseUrl,
  getCreatorPageDisplayUrl,
  getCreatorPageUrl,
  getPlatformBaseUrl,
  getPlatformHostLabel,
} from "@/lib/platform";

describe("platform URLs", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalPlatform = process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
  const originalApi = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalPlatform === undefined) {
      delete process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
    } else {
      process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL = originalPlatform;
    }
    if (originalApi === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApi;
    }
  });

  it("uses development defaults when NODE_ENV is not production", () => {
    process.env.NODE_ENV = "development";
    delete process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    expect(getPlatformBaseUrl()).toBe(PLATFORM_DEFAULTS.development.platformUrl);
    expect(getApiBaseUrl()).toBe(PLATFORM_DEFAULTS.development.apiUrl);
    expect(getPlatformHostLabel()).toBe("localhost:3000");
    expect(getCreatorPageUrl("ama_creates")).toBe("http://localhost:3000/ama_creates");
    expect(getCreatorPageDisplayUrl("ama_creates")).toBe("localhost:3000/ama_creates");
  });

  it("uses production defaults when NODE_ENV is production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    expect(getPlatformBaseUrl()).toBe(PLATFORM_DEFAULTS.production.platformUrl);
    expect(getApiBaseUrl()).toBe(PLATFORM_DEFAULTS.production.apiUrl);
    expect(getPlatformHostLabel()).toBe("tribetip.africa");
    expect(getCreatorPageUrl("ama_creates")).toBe("https://tribetip.africa/ama_creates");
  });

  it("respects NEXT_PUBLIC overrides", () => {
    process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL = "https://dev.tribetip.africa/";
    process.env.NEXT_PUBLIC_API_URL = "https://api.dev.tribetip.africa/";

    expect(getPlatformBaseUrl()).toBe("https://dev.tribetip.africa");
    expect(getApiBaseUrl()).toBe("https://api.dev.tribetip.africa");
  });
});

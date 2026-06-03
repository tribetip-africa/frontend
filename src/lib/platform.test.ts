import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PLATFORM_DEFAULTS,
  getApiBaseUrl,
  getCreatorPageUrl,
  getPlatformBaseUrl,
  getPlatformHostLabel,
} from "./platform.ts";

describe("platform URLs", () => {
  it("uses development defaults when NODE_ENV is not production", () => {
    assert.equal(getPlatformBaseUrl(), PLATFORM_DEFAULTS.development.platformUrl);
    assert.equal(getApiBaseUrl(), PLATFORM_DEFAULTS.development.apiUrl);
    assert.equal(getPlatformHostLabel(), "localhost:3000");
    assert.equal(getCreatorPageUrl("ama_creates"), "http://localhost:3000/ama_creates");
  });

  it("uses production defaults when NODE_ENV is production", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousPlatform = process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
    const previousApi = process.env.NEXT_PUBLIC_API_URL;

    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    try {
      assert.equal(getPlatformBaseUrl(), PLATFORM_DEFAULTS.production.platformUrl);
      assert.equal(getApiBaseUrl(), PLATFORM_DEFAULTS.production.apiUrl);
      assert.equal(getPlatformHostLabel(), "tribetip.africa");
      assert.equal(getCreatorPageUrl("ama_creates"), "https://tribetip.africa/ama_creates");
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
      if (previousPlatform === undefined) {
        delete process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
      } else {
        process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL = previousPlatform;
      }
      if (previousApi === undefined) {
        delete process.env.NEXT_PUBLIC_API_URL;
      } else {
        process.env.NEXT_PUBLIC_API_URL = previousApi;
      }
    }
  });

  it("respects NEXT_PUBLIC overrides", () => {
    const previousPlatform = process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
    const previousApi = process.env.NEXT_PUBLIC_API_URL;

    process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL = "https://dev.tribetip.africa/";
    process.env.NEXT_PUBLIC_API_URL = "https://api.dev.tribetip.africa/";

    try {
      assert.equal(getPlatformBaseUrl(), "https://dev.tribetip.africa");
      assert.equal(getApiBaseUrl(), "https://api.dev.tribetip.africa");
    } finally {
      if (previousPlatform === undefined) {
        delete process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
      } else {
        process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL = previousPlatform;
      }
      if (previousApi === undefined) {
        delete process.env.NEXT_PUBLIC_API_URL;
      } else {
        process.env.NEXT_PUBLIC_API_URL = previousApi;
      }
    }
  });
});

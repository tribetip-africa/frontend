import { defaultIndexNowUrls, getIndexNowKey, indexNowKeyLocation } from "@/lib/indexnow";

describe("indexnow", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.INDEXNOW_KEY;
    delete process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL;
    process.env.NODE_ENV = "development";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("builds the key file location from the configured key", () => {
    process.env.INDEXNOW_KEY = "abc123def456";

    expect(getIndexNowKey()).toBe("abc123def456");
    expect(indexNowKeyLocation("abc123def456")).toBe("http://localhost:3000/abc123def456.txt");
  });

  it("maps sitemap paths to absolute IndexNow URLs", () => {
    expect(defaultIndexNowUrls()).toEqual(
      expect.arrayContaining([
        "http://localhost:3000/",
        "http://localhost:3000/for-creators",
        "http://localhost:3000/faq",
      ]),
    );
  });
});

import { secureFetch } from "@/lib/secure-fetch";

describe("secureFetch", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("uses no-store for auth requests by default", async () => {
    await secureFetch("http://localhost:3001/tribes/sign_in.json", {
      method: "POST",
      body: "{}",
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.cache).toBe("no-store");
    expect(new Headers(init.headers).get("Cache-Control")).toContain("no-store");
  });

  it("applies publicShort revalidate on the server", async () => {
    await secureFetch("http://localhost:3001/tribes/demo_user", {
      cachePolicy: "publicShort",
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit & { next?: { revalidate?: number } }];
    expect(init.next?.revalidate).toBe(60);
  });

  it("never sends revalidate hints for noStore server fetches", async () => {
    await secureFetch("http://localhost:3001/tribes/sign_out.json", {
      method: "DELETE",
      cachePolicy: "noStore",
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit & { next?: { revalidate?: number } }];
    expect(init.next).toBeUndefined();
    expect(init.cache).toBe("no-store");
  });
});

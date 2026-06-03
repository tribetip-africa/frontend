import { CACHE_POLICIES, type CachePolicyName } from "@/lib/cache-policy";

type SecureFetchInit = RequestInit & {
  cachePolicy?: CachePolicyName;
  next?: { revalidate?: number };
};

export async function secureFetch(
  input: string,
  init: SecureFetchInit = {},
): Promise<Response> {
  const { cachePolicy = "noStore", next, ...requestInit } = init;
  const policy = CACHE_POLICIES[cachePolicy];

  const headers = new Headers(requestInit.headers);
  if (cachePolicy === "noStore") {
    headers.set("Cache-Control", "no-cache, no-store");
    headers.set("Pragma", "no-cache");
  }

  if (typeof window === "undefined" && cachePolicy !== "noStore") {
    return fetch(input, {
      ...requestInit,
      headers,
      next: { revalidate: next?.revalidate ?? policy.revalidate },
    });
  }

  return fetch(input, {
    ...requestInit,
    headers,
    cache: policy.fetchCache,
  });
}

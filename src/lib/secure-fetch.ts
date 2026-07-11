import { CACHE_POLICIES, type CachePolicyName } from "@/lib/cache-policy";
import { isCookieAuthEnabled } from "@/lib/auth-mode";
import { csrfHeaders } from "@/lib/csrf-storage";
import { getApiBaseUrl } from "@/lib/platform";

type SecureFetchInit = RequestInit & {
  cachePolicy?: CachePolicyName;
  next?: { revalidate?: number };
};

function shouldSendApiCredentials(input: string): boolean {
  if (!isCookieAuthEnabled() || typeof window === "undefined") return false;

  try {
    return new URL(input).origin === new URL(getApiBaseUrl()).origin;
  } catch {
    return false;
  }
}

export async function secureFetch(
  input: string,
  init: SecureFetchInit = {},
): Promise<Response> {
  const { cachePolicy = "noStore", next, ...requestInit } = init;
  const policy = CACHE_POLICIES[cachePolicy];
  const useApiCredentials = shouldSendApiCredentials(input);

  const headers = new Headers(requestInit.headers);
  if (cachePolicy === "noStore") {
    headers.set("Cache-Control", "no-cache, no-store");
    headers.set("Pragma", "no-cache");
  }

  if (useApiCredentials) {
    Object.entries(csrfHeaders()).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  const credentials = useApiCredentials
    ? "include"
    : (requestInit.credentials ?? "same-origin");

  if (typeof window === "undefined" && cachePolicy !== "noStore") {
    return fetch(input, {
      ...requestInit,
      credentials,
      headers,
      next: { revalidate: next?.revalidate ?? policy.revalidate },
    });
  }

  return fetch(input, {
    ...requestInit,
    credentials,
    headers,
    cache: policy.fetchCache,
  });
}

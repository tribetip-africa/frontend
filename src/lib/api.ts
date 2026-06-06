import type { AuthResponse, SignInPayload, SignUpPayload, CreatorProfile, UpdateProfilePayload } from "@/types/api";
import {
  TribetipAuthError,
  TribetipNetworkError,
  handleRequest,
  parseApiErrorBody,
} from "@/lib/errors";
import { getApiBaseUrl } from "@/lib/platform";
import { secureFetch } from "@/lib/secure-fetch";

const API_BASE = getApiBaseUrl();

/** @deprecated Use TribetipApiError from @/lib/errors */
export { TribetipApiError as ApiRequestError } from "@/lib/errors";

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

async function requestJson<T>(
  input: string,
  init: Parameters<typeof secureFetch>[1] = {},
): Promise<{ response: Response; data: T }> {
  return handleRequest(async () => {
    let response: Response;

    try {
      response = await secureFetch(input, init);
    } catch (error) {
      throw new TribetipNetworkError(undefined, error);
    }

    const data = await parseJson<T & Record<string, unknown>>(response);
    if (!response.ok) {
      throw parseApiErrorBody(response.status, data);
    }

    return { response, data };
  }, { url: input, method: init.method ?? "GET" });
}

function parseBearerToken(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice("Bearer ".length);
}

function extractToken(response: Response, data: AuthResponse): string | null {
  if (data.token) return data.token;
  return parseBearerToken(response.headers.get("Authorization"));
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const { response } = await requestJson<Record<string, unknown>>(`${API_BASE}/up`, {
      cachePolicy: "noStore",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export type PublicProfile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  country_code: string;
  currency: string;
  default_tip_amount_cents: number;
};

export async function fetchPublicProfile(username: string): Promise<PublicProfile> {
  const { data } = await requestJson<{ profile: PublicProfile }>(
    `${API_BASE}/tribes/${username}`,
    {
      cachePolicy: "publicShort",
      headers: { Accept: "application/json" },
    },
  );

  return data.profile;
}

export async function signUp(
  payload: SignUpPayload,
): Promise<{ data: AuthResponse; token: string | null }> {
  const { response, data } = await requestJson<AuthResponse>(
    `${API_BASE}/tribes.json`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ tribe: payload }),
    },
  );

  return {
    data: data as AuthResponse,
    token: extractToken(response, data as AuthResponse),
  };
}

export async function signIn(
  payload: SignInPayload,
): Promise<{ data: AuthResponse; token: string }> {
  const { response, data } = await requestJson<AuthResponse>(
    `${API_BASE}/tribes/sign_in.json`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ tribe: payload }),
    },
  );

  const token = extractToken(response, data as AuthResponse);
  if (!token) {
    throw new TribetipAuthError(
      "No authentication token returned. Restart the Rails API so CORS exposes Authorization, or ensure sign-in returns token in JSON.",
    );
  }

  return { data: data as AuthResponse, token };
}

export async function signOut(token: string): Promise<void> {
  await requestJson<Record<string, unknown>>(`${API_BASE}/tribes/sign_out.json`, {
    method: "DELETE",
    cachePolicy: "noStore",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

function authHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchMyProfile(token: string): Promise<CreatorProfile> {
  const { data } = await requestJson<{ profile: CreatorProfile }>(`${API_BASE}/me/profile`, {
    cachePolicy: "noStore",
    headers: authHeaders(token),
  });

  return data.profile;
}

export async function updateMyProfile(
  token: string,
  payload: UpdateProfilePayload,
): Promise<CreatorProfile> {
  const { data } = await requestJson<{ profile: CreatorProfile }>(`${API_BASE}/me/profile`, {
    method: "PATCH",
    cachePolicy: "noStore",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ profile: payload }),
  });

  return data.profile;
}

export async function publishMyProfile(token: string): Promise<CreatorProfile> {
  const { data } = await requestJson<{ profile: CreatorProfile }>(
    `${API_BASE}/me/profile/publish`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: authHeaders(token),
    },
  );

  return data.profile;
}

export { API_BASE };

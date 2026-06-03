import type {
  ApiError,
  AuthResponse,
  SignInPayload,
  SignUpPayload,
} from "@/types/api";
import { getApiBaseUrl } from "@/lib/platform";
import { secureFetch } from "@/lib/secure-fetch";

const API_BASE = getApiBaseUrl();

export class ApiRequestError extends Error {
  status: number;
  body: ApiError;

  constructor(status: number, body: ApiError, message?: string) {
    super(message ?? body.errors?.join(", ") ?? body.error ?? "Request failed");
    this.status = status;
    this.body = body;
  }
}

function parseBearerToken(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice("Bearer ".length);
}

function extractToken(response: Response, data: AuthResponse): string | null {
  if (data.token) return data.token;
  return parseBearerToken(response.headers.get("Authorization"));
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await secureFetch(`${API_BASE}/up`, { cachePolicy: "noStore" });
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
  const response = await secureFetch(`${API_BASE}/tribes/${username}`, {
    cachePolicy: "publicShort",
    headers: { Accept: "application/json" },
  });

  const data = await parseJson<{ profile: PublicProfile } & ApiError>(response);
  if (!response.ok) {
    throw new ApiRequestError(response.status, data);
  }

  return data.profile;
}

export async function signUp(
  payload: SignUpPayload,
): Promise<{ data: AuthResponse; token: string | null }> {
  const response = await secureFetch(`${API_BASE}/tribes.json`, {
    method: "POST",
    cachePolicy: "noStore",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ tribe: payload }),
  });

  const data = await parseJson<AuthResponse & ApiError>(response);
  if (!response.ok) {
    throw new ApiRequestError(response.status, data);
  }

  return {
    data: data as AuthResponse,
    token: extractToken(response, data as AuthResponse),
  };
}

export async function signIn(
  payload: SignInPayload,
): Promise<{ data: AuthResponse; token: string }> {
  const response = await secureFetch(`${API_BASE}/tribes/sign_in.json`, {
    method: "POST",
    cachePolicy: "noStore",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ tribe: payload }),
  });

  const data = await parseJson<AuthResponse & ApiError>(response);
  if (!response.ok) {
    throw new ApiRequestError(response.status, data);
  }

  const token = extractToken(response, data as AuthResponse);
  if (!token) {
    throw new Error(
      "No authentication token returned. Restart the Rails API so CORS exposes Authorization, or ensure sign-in returns token in JSON.",
    );
  }

  return { data: data as AuthResponse, token };
}

export async function signOut(token: string): Promise<void> {
  const response = await secureFetch(`${API_BASE}/tribes/sign_out.json`, {
    method: "DELETE",
    cachePolicy: "noStore",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await parseJson<ApiError>(response);
    throw new ApiRequestError(response.status, data);
  }
}

export { API_BASE };

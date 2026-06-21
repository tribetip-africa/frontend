import {
  handleRequest,
  parseApiErrorBody,
  TribetipNetworkError,
} from "@/lib/errors";
import { secureFetch } from "@/lib/secure-fetch";

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export function authHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function requestJson<T>(
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

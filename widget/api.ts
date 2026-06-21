import {
  handleRequest,
  parseApiErrorBody,
  TribetipNetworkError,
} from "@/lib/errors";
import { getApiBaseUrl } from "@/lib/platform";
import { secureFetch } from "@/lib/secure-fetch";
import type { UpdateWidgetEmbedPayload, WidgetEmbedPayload } from "@/widget/types";

const API_BASE = getApiBaseUrl();

function authHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

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

export async function fetchMyWidgetEmbed(authToken: string): Promise<WidgetEmbedPayload> {
  const { data } = await requestJson<{ widget_embed: WidgetEmbedPayload }>(
    `${API_BASE}/me/widget_embed`,
    {
      cachePolicy: "noStore",
      headers: authHeaders(authToken),
    },
  );

  return data.widget_embed;
}

export async function updateMyWidgetEmbed(
  authToken: string,
  payload: UpdateWidgetEmbedPayload,
): Promise<WidgetEmbedPayload> {
  const { data } = await requestJson<{ widget_embed: WidgetEmbedPayload }>(
    `${API_BASE}/me/widget_embed`,
    {
      method: "PATCH",
      cachePolicy: "noStore",
      headers: {
        ...authHeaders(authToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ widget_embed: payload }),
    },
  );

  return data.widget_embed;
}

export async function rotateMyWidgetEmbed(authToken: string): Promise<WidgetEmbedPayload> {
  const { data } = await requestJson<{ widget_embed: WidgetEmbedPayload; message?: string }>(
    `${API_BASE}/me/widget_embed/rotate`,
    {
      method: "POST",
      cachePolicy: "noStore",
      headers: authHeaders(authToken),
    },
  );

  return data.widget_embed;
}

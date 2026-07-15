import { authHeaders, requestJson } from "@/lib/api-request";
import { getApiBaseUrl } from "@/lib/platform";
import type { UpdateWidgetEmbedPayload, WidgetEmbedPayload } from "@/widget/types";

const API_BASE = getApiBaseUrl();

export async function fetchMyWidgetEmbed(authToken: string | null): Promise<WidgetEmbedPayload> {
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
  authToken: string | null,
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

export async function rotateMyWidgetEmbed(authToken: string | null): Promise<WidgetEmbedPayload> {
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

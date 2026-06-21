import type { WidgetPosition } from "@/widget/embed";

export type { WidgetPosition };

export type WidgetEmbedConfig = {
  app_name: string;
  username: string;
  display_name: string;
  bio: string | null;
  country_label: string;
  currency: string;
  destination_url: string;
  icon_url: string | null;
  accent_color: string;
  position: WidgetPosition;
  cta_text: string;
  tip_presets: string[];
  payment_hint: string;
  open_same_tab: boolean;
};

export type WidgetEmbedPayload = {
  token: string | null;
  enabled: boolean;
  active: boolean;
  embed_snippet: string | null;
  destination_url: string | null;
  icon_url: string | null;
  accent_color: string;
  position: WidgetPosition;
  cta_text: string;
  open_same_tab: boolean;
  config: WidgetEmbedConfig | null;
};

export type UpdateWidgetEmbedPayload = {
  widget_enabled?: boolean;
  widget_destination_url?: string | null;
  widget_icon_url?: string | null;
  widget_accent_color?: string;
  widget_position?: WidgetPosition;
  widget_cta_text?: string;
  widget_open_same_tab?: boolean;
};

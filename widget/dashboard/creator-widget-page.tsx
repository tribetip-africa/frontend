"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useDashboard } from "@/context/dashboard-context";
import {
  fetchMyWidgetEmbed,
  rotateMyWidgetEmbed,
  updateMyWidgetEmbed,
} from "@/widget/api";
import {
  DEFAULT_WIDGET_CTA_TEXT,
  DEFAULT_WIDGET_POSITION,
  WIDGET_POSITIONS,
  widgetCountryLabel,
  widgetPaymentHint,
  widgetPositionLabel,
  widgetSetupHint,
  widgetSupportLabel,
  type WidgetPosition,
} from "@/widget/embed";
import { WidgetMiniCard } from "@/widget/mini-card";
import type { UpdateWidgetEmbedPayload, WidgetEmbedPayload } from "@/widget/types";
import { getDisplayMessage } from "@/lib/errors";
import { getCreatorPageUrl } from "@/lib/platform";
import { runAfterPaint } from "@/lib/run-after-paint";

function WidgetPreview({
  username,
  displayName,
  bio,
  countryCode,
  currency,
  defaultTipAmountCents,
  ctaText,
  iconUrl,
  position,
}: {
  username: string;
  displayName: string;
  bio: string | null;
  countryCode: string;
  currency: string;
  defaultTipAmountCents: number;
  ctaText: string;
  iconUrl: string | null;
  position: WidgetPosition;
}) {
  return (
    <div className="relative min-h-[28rem] overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(36,122,69,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(36,122,69,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <p className="absolute left-5 top-5 max-w-xs text-sm text-brand-700">
        Visitors on your site will see a mini tip card like this. Clicking it opens your full tip page.
      </p>
      <WidgetMiniCard
        username={username}
        displayName={displayName}
        bio={bio}
        countryLabel={widgetCountryLabel(countryCode)}
        currency={currency}
        defaultTipAmountCents={defaultTipAmountCents}
        ctaText={widgetSupportLabel(username, ctaText)}
        iconUrl={iconUrl}
        paymentHint={widgetPaymentHint(countryCode)}
        position={position}
      />
    </div>
  );
}

export function CreatorWidgetPage() {
  const { tribe, profile, token } = useDashboard();
  const [widgetEmbed, setWidgetEmbed] = useState<WidgetEmbedPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rotateOpen, setRotateOpen] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [position, setPosition] = useState<WidgetPosition>(DEFAULT_WIDGET_POSITION);
  const [ctaText, setCtaText] = useState(DEFAULT_WIDGET_CTA_TEXT);

  const previewProfile = useMemo(
    () => ({
      username: tribe.username,
      displayName: profile?.display_name?.trim() || tribe.username,
      bio: profile?.bio ?? null,
      countryCode: profile?.country_code ?? "KE",
      currency: profile?.currency ?? "KES",
      defaultTipAmountCents: profile?.default_tip_amount_cents ?? 50_000,
    }),
    [profile, tribe.username],
  );

  const defaultDestination = useMemo(() => getCreatorPageUrl(tribe.username), [tribe.username]);

  const syncForm = useCallback((payload: WidgetEmbedPayload) => {
    setWidgetEmbed(payload);
    setEnabled(payload.enabled);
    setDestinationUrl(payload.destination_url ?? "");
    setIconUrl(payload.icon_url ?? "");
    setPosition(payload.position || DEFAULT_WIDGET_POSITION);
    setCtaText(payload.cta_text || DEFAULT_WIDGET_CTA_TEXT);
  }, []);

  const loadWidgetEmbed = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchMyWidgetEmbed(token);
      syncForm(payload);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [syncForm, token]);

  useEffect(() => {
    runAfterPaint(() => loadWidgetEmbed());
  }, [loadWidgetEmbed]);

  const buildUpdatePayload = useCallback(
    (overrides: UpdateWidgetEmbedPayload = {}): UpdateWidgetEmbedPayload => ({
      widget_enabled: enabled,
      widget_destination_url: destinationUrl.trim() || null,
      widget_icon_url: iconUrl.trim() || null,
      widget_position: position,
      widget_cta_text: ctaText.trim() || DEFAULT_WIDGET_CTA_TEXT,
      ...overrides,
    }),
    [ctaText, destinationUrl, enabled, iconUrl, position],
  );

  const saveWidgetEmbed = useCallback(
    async (overrides: UpdateWidgetEmbedPayload = {}) => {
      setSaving(true);
      setError(null);

      try {
        const payload = await updateMyWidgetEmbed(token, buildUpdatePayload(overrides));
        syncForm(payload);
      } catch (err) {
        setError(getDisplayMessage(err));
      } finally {
        setSaving(false);
      }
    },
    [buildUpdatePayload, syncForm, token],
  );

  const handleToggle = useCallback(async () => {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    await saveWidgetEmbed({ widget_enabled: nextEnabled });
  }, [enabled, saveWidgetEmbed]);

  const handleRotate = useCallback(async () => {
    setRotating(true);
    setError(null);

    try {
      const payload = await rotateMyWidgetEmbed(token);
      syncForm(payload);
      setRotateOpen(false);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setRotating(false);
    }
  }, [syncForm, token]);

  const copySnippet = useCallback(async () => {
    if (!widgetEmbed?.embed_snippet) return;

    try {
      await navigator.clipboard.writeText(widgetEmbed.embed_snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [widgetEmbed]);

  const previewActive = widgetEmbed?.active ?? false;

  return (
    <>
      <DashboardPageHeader
        title="Website widget"
        description="Add a mini tip card to your site with one script tag."
      />

      <div className="space-y-5">
        <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold text-brand-900">What this does</h2>
          <p className="mt-2 text-sm text-brand-700">
            The widget shows a mini tip card on your website — the same style as our landing page
            preview. When visitors click it, they open your Tribetip tip page in a new tab (or the
            same tab if you enable that option). Paste the embed code once on your site — profile,
            amounts, and button text sync automatically. You only need to update the snippet if you
            regenerate your token.
          </p>
          <p className="mt-3 text-sm text-brand-700">
            Need to edit your public tip page first?{" "}
            <Link href="/dashboard/public-page" className="font-medium text-brand-700 underline">
              Go to Public page settings
            </Link>
            .
          </p>
        </section>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-brand-900">Live preview</h2>
              <p className="mt-1 text-sm text-brand-700">{widgetSetupHint(previewActive)}</p>
            </div>
            <Button
              type="button"
              variant={enabled ? "secondary" : "primary"}
              disabled={saving || loading}
              onClick={() => void handleToggle()}
            >
              {enabled ? "Turn widget off" : "Turn widget on"}
            </Button>
          </div>

          <div className="mt-5">
            <WidgetPreview
              username={previewProfile.username}
              displayName={previewProfile.displayName}
              bio={previewProfile.bio}
              countryCode={previewProfile.countryCode}
              currency={previewProfile.currency}
              defaultTipAmountCents={previewProfile.defaultTipAmountCents}
              ctaText={ctaText}
              iconUrl={iconUrl.trim() || null}
              position={position}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold text-brand-900">Embed snippet</h2>
          <p className="mt-1 text-sm text-brand-700">
            Paste this before the closing <code className="font-mono text-xs">&lt;/body&gt;</code>{" "}
            tag on your site. Turning the widget off removes the card from your site within a few
            seconds without deleting this snippet.
          </p>

          {loading && !widgetEmbed ? (
            <p className="mt-4 text-sm text-brand-700">Loading your widget settings…</p>
          ) : (
            <div className="mt-4 space-y-3">
              <textarea
                readOnly
                rows={3}
                value={widgetEmbed?.embed_snippet ?? "Turn the widget on to generate your embed code."}
                className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 font-mono text-xs text-brand-900"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!widgetEmbed?.embed_snippet}
                  onClick={() => void copySnippet()}
                >
                  {copied ? "Snippet copied" : "Copy snippet"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!widgetEmbed?.token}
                  onClick={() => setRotateOpen(true)}
                >
                  Regenerate token
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold text-brand-900">Customize</h2>
          <p className="mt-1 text-sm text-brand-700">
            Save changes here — they sync to every site using your snippet within a few seconds. No
            need to re-paste the embed code.
          </p>

          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              void saveWidgetEmbed();
            }}
          >
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="widget_destination_url" className="text-xs font-medium uppercase tracking-wide text-brand-600">
                Destination URL
              </label>
              <input
                id="widget_destination_url"
                type="url"
                value={destinationUrl}
                onChange={(event) => setDestinationUrl(event.target.value)}
                placeholder={defaultDestination}
                className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900"
              />
              <p className="text-xs text-brand-600">
                Leave blank to use your default tip page ({defaultDestination.replace(/^https?:\/\//, "")}).
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="widget_cta_text" className="text-xs font-medium uppercase tracking-wide text-brand-600">
                Button text
              </label>
              <input
                id="widget_cta_text"
                type="text"
                maxLength={80}
                value={ctaText}
                onChange={(event) => setCtaText(event.target.value)}
                placeholder={widgetSupportLabel(tribe.username)}
                className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="widget_position" className="text-xs font-medium uppercase tracking-wide text-brand-600">
                Position
              </label>
              <select
                id="widget_position"
                value={position}
                onChange={(event) => setPosition(event.target.value as WidgetPosition)}
                className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900"
              >
                {WIDGET_POSITIONS.map((value) => (
                  <option key={value} value={value}>
                    {widgetPositionLabel(value)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="widget_icon_url" className="text-xs font-medium uppercase tracking-wide text-brand-600">
                Icon URL (optional)
              </label>
              <input
                id="widget_icon_url"
                type="url"
                value={iconUrl}
                onChange={(event) => setIconUrl(event.target.value)}
                placeholder="https://example.com/icon.png"
                className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900"
              />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving || loading}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </section>
      </div>

      <Modal open={rotateOpen} onClose={() => setRotateOpen(false)} title="Regenerate widget token?">
        <p className="text-sm text-brand-700">
          Sites using your current embed snippet will stop showing the button until you paste the
          new snippet.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setRotateOpen(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={rotating} onClick={() => void handleRotate()}>
            {rotating ? "Regenerating…" : "Regenerate token"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

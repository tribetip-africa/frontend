"use client";

import { FormEvent, useState } from "react";
import { getDisplayMessage } from "@/lib/errors";
import { isPaystackSubaccountVerified } from "@/lib/paystack-onboarding";
import { publishMyProfile, updateMyProfile } from "@/lib/api";
import {
  MIN_TIP_UNITS,
  centsToUnits,
  parseAmountInput,
  unitsToCents,
  formatMoneyUnits,
} from "@/lib/money";
import { buildTipPresets } from "@/lib/tip-amounts";
import type { CreatorProfile } from "@/types/api";
import { Button } from "@/components/ui/button";

type ProfileSettingsProps = {
  token: string | null;
  initialProfile: CreatorProfile;
  onProfileChange: (profile: CreatorProfile) => void;
  embedded?: boolean;
};

export function ProfileSettings({
  token,
  initialProfile,
  onProfileChange,
  embedded = false,
}: ProfileSettingsProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [displayName, setDisplayName] = useState(initialProfile.display_name ?? "");
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [defaultTipAmountInput, setDefaultTipAmountInput] = useState(
    String(centsToUnits(initialProfile.default_tip_amount_cents)),
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const payoutVerified = isPaystackSubaccountVerified(profile);
  const previewDefaultCents = (() => {
    const units = parseAmountInput(defaultTipAmountInput);
    return units ? unitsToCents(units) : profile.default_tip_amount_cents;
  })();
  const tipPresets = buildTipPresets(previewDefaultCents, profile.currency);
  const canPublish =
    profile.account_status === "active" &&
    !profile.is_profile_public &&
    displayName.trim().length > 0 &&
    payoutVerified;

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const defaultTipUnits = parseAmountInput(defaultTipAmountInput);
      if (defaultTipUnits === null || defaultTipUnits < MIN_TIP_UNITS) {
        setError(`Enter a default tip amount of at least ${MIN_TIP_UNITS} ${profile.currency}.`);
        return;
      }

      const updated = await updateMyProfile(token, {
        display_name: displayName.trim(),
        bio: bio.trim(),
        default_tip_amount_cents: unitsToCents(defaultTipUnits),
      });
      setProfile(updated);
      onProfileChange(updated);
      setMessage("Profile saved.");
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setError(null);
    setMessage(null);
    setPublishing(true);

    try {
      const updated = await publishMyProfile(token);
      setProfile(updated);
      onProfileChange(updated);
      setMessage("Your public page is live.");
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setPublishing(false);
    }
  }

  const form = (
    <form onSubmit={handleSave} className={embedded ? "space-y-4" : "mt-5 space-y-4"}>
        <div>
          <label htmlFor="display_name" className="mb-1.5 block text-sm font-medium text-brand-800">
            Display name
          </label>
          <input
            id="display_name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-900"
            placeholder="How supporters see you"
            required
          />
        </div>

        <div>
          <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-brand-800">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-900"
            placeholder="Tell supporters what you create"
          />
        </div>

        <div>
          <label
            htmlFor="default_tip_amount"
            className="mb-1.5 block text-sm font-medium text-brand-800"
          >
            Default tip amount ({profile.currency})
          </label>
          <input
            id="default_tip_amount"
            type="number"
            min={MIN_TIP_UNITS}
            step="1"
            value={defaultTipAmountInput}
            onChange={(event) => setDefaultTipAmountInput(event.target.value)}
            className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-900"
            placeholder="Suggested amount on your public page"
            required
          />
          <p className="mt-1.5 text-xs text-brand-600">
            Supporters see presets based on this amount:{" "}
            {tipPresets
              .filter((preset) => preset.cents !== null)
              .map((preset) => preset.label)
              .join(" · ")}
            {defaultTipAmountInput.trim() && (
              <>
                {" "}
                · custom from {formatMoneyUnits(parseAmountInput(defaultTipAmountInput) ?? 0, profile.currency)}
              </>
            )}
          </p>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
            {message}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!canPublish || publishing}
            onClick={handlePublish}
          >
            {profile.is_profile_public
              ? "Published"
              : publishing
                ? "Publishing…"
                : "Publish page"}
          </Button>
        </div>

        {profile.account_status !== "active" && !profile.is_profile_public && (
          <p className="text-xs text-brand-600">
            Add a display name and save your profile. Publishing unlocks once payout setup is
            complete.
          </p>
        )}

        {profile.account_status === "active" &&
          !profile.is_profile_public &&
          !payoutVerified &&
          profile.paystack_onboarding.complete && (
            <p className="text-xs text-amber-800">
              {profile.paystack_onboarding.payout?.publish_blocker ??
                "Paystack is still verifying your payout account. Refresh payout status below, then try again."}
            </p>
          )}
      </form>
  );

  if (embedded) return form;

  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-brand-900">Profile settings</h2>
      <p className="mt-1 text-sm text-brand-700">
        Set how you appear on your public tip page.
      </p>
      {form}
    </section>
  );
}

"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createTip } from "@/lib/api";
import { createIdempotencyKey } from "@/lib/idempotency-key";
import { checkoutPhaseLabel, type TipCheckoutPhase } from "@/lib/tip-checkout";
import { buildTipPresets, type TipPreset } from "@/lib/tip-amounts";
import {
  centsToUnits,
  formatMoney,
  MIN_TIP_UNITS,
  parseAmountInput,
  unitsToCents,
} from "@/lib/money";
import { getDisplayMessage } from "@/lib/errors";
import type { PublicProfile } from "@/lib/api";
import { AnimatedCheckmark } from "@/components/animated-checkmark";
import { Button } from "@/components/ui/button";
import { TipConfirmModal } from "@/components/tip-confirm-modal";

type TipFormProps = {
  profile: PublicProfile;
  showSuccess?: boolean;
};

function presetButtonClass(active: boolean, disabled: boolean) {
  return [
    "rounded-xl border py-2.5 text-sm font-semibold transition",
    active
      ? "border-brand-600 bg-brand-600 text-white shadow-sm"
      : "border-brand-200 bg-brand-50 text-brand-800 hover:border-brand-300 hover:bg-brand-100/80",
    disabled ? "cursor-not-allowed opacity-60" : "",
  ].join(" ");
}

export function TipForm({ profile, showSuccess = false }: TipFormProps) {
  const [successVisible, setSuccessVisible] = useState(showSuccess);

  useEffect(() => {
    if (showSuccess) {
      setSuccessVisible(true);
    }
  }, [showSuccess]);

  const presets = useMemo(
    () => buildTipPresets(profile.default_tip_amount_cents, profile.currency),
    [profile.default_tip_amount_cents, profile.currency],
  );

  const [selectedPreset, setSelectedPreset] = useState<TipPreset["id"]>("standard");
  const [amountCents, setAmountCents] = useState(profile.default_tip_amount_cents);
  const [customAmountInput, setCustomAmountInput] = useState(
    String(centsToUnits(profile.default_tip_amount_cents)),
  );
  const [supporterEmail, setSupporterEmail] = useState("");
  const [supporterName, setSupporterName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [checkoutPhase, setCheckoutPhase] = useState<TipCheckoutPhase>("idle");
  const tipIdempotencyKey = useRef<string | null>(null);

  const submitting = checkoutPhase !== "idle";
  const showCustomAmount = selectedPreset === "custom";

  const displayAmountCents = useMemo(() => {
    if (showCustomAmount) {
      const units = parseAmountInput(customAmountInput);
      if (units === null) {
        return amountCents;
      }

      return unitsToCents(units);
    }

    return amountCents;
  }, [amountCents, customAmountInput, showCustomAmount]);

  function selectPreset(preset: TipPreset) {
    setSelectedPreset(preset.id);
    if (preset.cents !== null) {
      setAmountCents(preset.cents);
      setCustomAmountInput(String(centsToUnits(preset.cents)));
    }
  }

  function resolveAmountCents(): number | null {
    if (showCustomAmount) {
      const units = parseAmountInput(customAmountInput);
      if (units === null || units < MIN_TIP_UNITS) {
        return null;
      }

      return unitsToCents(units);
    }

    return amountCents;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const resolvedAmountCents = resolveAmountCents();
    if (resolvedAmountCents === null) {
      setError(`Enter at least ${MIN_TIP_UNITS} ${profile.currency}.`);
      return;
    }

    setAmountCents(resolvedAmountCents);
    setConfirmOpen(true);
  }

  async function handleConfirmTip() {
    setError(null);

    const resolvedAmountCents = resolveAmountCents();
    if (resolvedAmountCents === null) {
      setError(`Enter at least ${MIN_TIP_UNITS} ${profile.currency}.`);
      setConfirmOpen(false);
      return;
    }

    setAmountCents(resolvedAmountCents);

    const idempotencyKey = tipIdempotencyKey.current ?? createIdempotencyKey();
    tipIdempotencyKey.current = idempotencyKey;

    setCheckoutPhase("starting");

    try {
      const tip = await createTip(
        {
          username: profile.username,
          amount_cents: resolvedAmountCents,
          currency: profile.currency,
          supporter_email: supporterEmail.trim(),
          supporter_name: supporterName.trim() || undefined,
          message: message.trim() || undefined,
        },
        {
          idempotencyKey,
          onCheckoutPolling: () => setCheckoutPhase("polling"),
        },
      );

      if (tip.authorization_url) {
        setCheckoutPhase("redirecting");
        window.location.assign(tip.authorization_url);
        return;
      }

      setError("Checkout could not be started. Please try again.");
      setCheckoutPhase("idle");
      setConfirmOpen(false);
      tipIdempotencyKey.current = null;
    } catch (err) {
      setError(getDisplayMessage(err));
      setCheckoutPhase("idle");
      setConfirmOpen(false);
      tipIdempotencyKey.current = null;
    }
  }

  const buttonLabel =
    checkoutPhase === "idle"
      ? `Review & send ${formatMoney(displayAmountCents, profile.currency)}`
      : checkoutPhaseLabel(checkoutPhase);

  if (successVisible) {
    return (
      <div
        className="rounded-2xl border border-green-200 bg-green-50/60 px-4 py-8 text-center"
        role="status"
      >
        <AnimatedCheckmark />
        <p className="mt-5 text-lg font-semibold text-brand-900">Thank you for your support!</p>
        <p className="mt-2 text-sm leading-relaxed text-brand-700">
          Your tip is being processed. It may take a moment to appear for the creator.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="text-sm font-medium text-brand-800">Choose an amount</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={submitting}
                className={presetButtonClass(selectedPreset === preset.id, submitting)}
                onClick={() => selectPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {showCustomAmount && (
            <div className="mt-3">
              <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-brand-800">
                Custom amount
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  min={MIN_TIP_UNITS}
                  step="any"
                  required
                  value={customAmountInput}
                  onChange={(event) => setCustomAmountInput(event.target.value)}
                  disabled={submitting}
                  placeholder="500"
                  className="w-full rounded-xl border border-brand-200 px-3 py-2.5 pr-14 text-sm text-brand-900 disabled:bg-brand-50"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-brand-500">
                  {profile.currency}
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-600">
                Enter the amount in {profile.currency}, not the smallest unit.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Your details
          </p>
          <p className="mt-1 text-xs text-brand-600">
            For your receipt only. No TribeTip account required.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="supporter_email"
                className="mb-1.5 block text-sm font-medium text-brand-800"
              >
                Email
              </label>
              <input
                id="supporter_email"
                type="email"
                autoComplete="email"
                required
                value={supporterEmail}
                onChange={(event) => setSupporterEmail(event.target.value)}
                disabled={submitting}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-900 disabled:bg-brand-50"
              />
            </div>

            <div>
              <label
                htmlFor="supporter_name"
                className="mb-1.5 block text-sm font-medium text-brand-800"
              >
                Name <span className="font-normal text-brand-500">(optional)</span>
              </label>
              <input
                id="supporter_name"
                value={supporterName}
                onChange={(event) => setSupporterName(event.target.value)}
                disabled={submitting}
                placeholder="How the creator sees you"
                className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-900 disabled:bg-brand-50"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-brand-800">
                Message <span className="font-normal text-brand-500">(optional)</span>
              </label>
              <textarea
                id="message"
                rows={3}
                maxLength={280}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={submitting}
                placeholder="Say thanks or leave encouragement"
                className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-900 disabled:bg-brand-50"
              />
            </div>
          </div>
        </div>

        {submitting && checkoutPhase === "polling" && (
          <p
            className="rounded-xl border border-brand-100 bg-white px-3 py-2 text-sm text-brand-800"
            role="status"
          >
            Paystack is preparing your secure checkout. This usually takes a few seconds.
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="w-full py-3 text-base">
          {buttonLabel}
        </Button>

        <p className="text-center text-xs leading-relaxed text-brand-600">
          Secured by Paystack · Card & mobile money · No supporter account needed
        </p>
      </form>

      <TipConfirmModal
        open={confirmOpen}
        profile={profile}
        amountCents={displayAmountCents}
        supporterEmail={supporterEmail}
        supporterName={supporterName}
        message={message}
        checkoutPhase={checkoutPhase}
        onClose={() => {
          if (checkoutPhase === "idle") {
            setConfirmOpen(false);
          }
        }}
        onConfirm={handleConfirmTip}
      />
    </>
  );
}

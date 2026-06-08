"use client";

import { useEffect, useId, useState } from "react";
import { formatMoney } from "@/lib/money";
import { maskAccountNumber } from "@/lib/mask-account";
import { payoutCardTheme } from "@/lib/payout-card-theme";
import type { PayoutCardData } from "@/lib/payout-card-data";

/** Hide earnings on the card back after this long (security). */
const CARD_BALANCE_VIEW_MS = 5 * 1000;

type PayoutCardProps = {
  data: PayoutCardData;
};

function CardChip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-9 w-12 rounded-md bg-gradient-to-br shadow-inner ${className}`}
      aria-hidden
    >
      <div className="mx-auto mt-2 h-px w-8 bg-black/15" />
      <div className="mx-auto mt-1.5 h-px w-6 bg-black/10" />
      <div className="mx-auto mt-1.5 h-px w-8 bg-black/10" />
    </div>
  );
}

function ContactlessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 opacity-80" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M8.5 12.5a4 4 0 0 1 5.66-5.66M6 15a7.5 7.5 0 0 1 10.61-10.61M3.5 17.5a11 11 0 0 1 15.56-15.56"
      />
    </svg>
  );
}

export function PayoutCard({ data }: PayoutCardProps) {
  const [flipped, setFlipped] = useState(false);
  const hintId = useId();
  const theme = payoutCardTheme(data.countryCode, data.currency);
  const cardholder = (data.accountName || data.displayName || `@${data.username}`).toUpperCase();
  const maskedNumber = maskAccountNumber(data.accountNumber);
  const institution = data.settlementBank ?? theme.network;
  const statusLabel = !data.linked
    ? "Setup required"
    : data.verified
      ? "Verified"
      : "Pending verification";

  const totalEarned = typeof data.totalEarnedCents === "number" ? data.totalEarnedCents : 0;
  const canFlip = data.linked || typeof data.totalEarnedCents === "number";

  function toggleFlip() {
    if (!canFlip) return;
    setFlipped((current) => !current);
  }

  useEffect(() => {
    if (!flipped) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFlipped(false);
    }, CARD_BALANCE_VIEW_MS);

    return () => window.clearTimeout(timer);
  }, [flipped]);

  return (
    <div className="w-full">
      <div className="payout-card-scene mx-auto w-full max-w-full sm:max-w-[520px]">
        <button
          type="button"
          className={`payout-card group relative block aspect-[1.586/1] w-full rounded-[1.35rem] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${flipped ? "is-flipped" : ""} ${canFlip ? "cursor-pointer" : "cursor-default"}`}
          onClick={toggleFlip}
          disabled={!canFlip}
          aria-pressed={flipped}
          aria-describedby={hintId}
          aria-label={
            canFlip
              ? flipped
                ? "Hide total earned"
                : "Show total earned"
              : "Payout card preview — complete setup to view earnings"
          }
        >
          <div className="payout-card-inner h-full w-full">
            <div
              className={`payout-card-face absolute inset-0 overflow-hidden rounded-[1.35rem] bg-gradient-to-br p-5 shadow-2xl shadow-black/25 ${theme.gradient}`}
            >
              <div className={`pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full blur-3xl ${theme.glow}`} />
              <div
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${theme.accentBar}`}
              />

              <div className="relative flex h-full flex-col justify-between text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                      TribeTip
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                      <span aria-hidden>{theme.flag}</span>
                      <span>{theme.marketName}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-white/60">Currency</p>
                    <p className="text-lg font-bold tracking-wide">{theme.currency}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <CardChip className={theme.chip} />
                  <ContactlessIcon />
                </div>

                <div>
                  <p className="font-mono text-lg tracking-[0.18em] text-white/95 sm:text-xl">
                    {maskedNumber}
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-white/55">Account holder</p>
                      <p className="truncate text-sm font-semibold tracking-wide">{cardholder}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] uppercase tracking-wider text-white/55">Status</p>
                      <p className="text-xs font-semibold">{statusLabel}</p>
                    </div>
                  </div>
                  <p className="mt-3 truncate text-xs text-white/70">{institution}</p>
                </div>
              </div>
            </div>

            <div
              className={`payout-card-face payout-card-back absolute inset-0 overflow-hidden rounded-[1.35rem] bg-gradient-to-br p-5 shadow-2xl shadow-black/25 ${theme.gradient}`}
            >
              <div className="relative flex h-full flex-col text-white">
                <div className="h-10 rounded-md bg-neutral-950/85" aria-hidden />

                <div className="mt-4 flex flex-1 flex-col justify-between">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                      Total earned
                    </p>
                    <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-white">
                      {formatMoney(totalEarned, theme.currency)}
                    </p>
                    <p className="mt-2 text-xs text-white/60">Lifetime paid tips</p>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/55">Secured by</p>
                      <p className="text-sm font-semibold">Paystack</p>
                    </div>
                    <div className="rounded-md bg-white/90 px-3 py-2 text-right">
                      <p className="text-[9px] uppercase tracking-wider text-neutral-500">Region</p>
                      <p className="text-xs font-bold text-neutral-900">
                        {theme.flag} {theme.countryCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      <p id={hintId} className="mt-3 text-center text-xs text-brand-600">
        {canFlip
          ? flipped
            ? "Auto-hides in 5 seconds · Tap the card to return to account details"
            : "Tap the card to reveal total earned"
          : "Complete payout setup to unlock your earnings view"}
      </p>
    </div>
  );
}

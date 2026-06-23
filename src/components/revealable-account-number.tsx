"use client";

import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchPaystackAccountNumber } from "@/lib/api";
import { isReauthenticationRequiredError } from "@/lib/auth-session";
import { maskAccountNumber } from "@/lib/mask-account";

const REVEAL_DURATION_MS = 5_000;

type RevealableAccountNumberProps = {
  value: string;
  token?: string;
  fullValue?: string;
  className?: string;
  mono?: boolean;
  revealDurationMs?: number;
  onRevealRequest?: () => Promise<string | null | undefined>;
};

function displayMaskedAccount(value: string): string {
  if (value.includes("•")) return value;
  return maskAccountNumber(value);
}

function EyeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M2.036 12.322a1 1 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EyeSlashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c1.307 0 2.56-.24 3.728-.68M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type RevealableAccountNumberInnerProps = RevealableAccountNumberProps & {
  maskedValue: string;
};

function RevealableAccountNumberInner({
  maskedValue,
  token,
  fullValue,
  className = "",
  mono = false,
  revealDurationMs = REVEAL_DURATION_MS,
  onRevealRequest,
}: RevealableAccountNumberInnerProps) {
  const pathname = usePathname();
  const [revealedFull, setRevealedFull] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reauthRequired, setReauthRequired] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearRevealTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hideAccountNumber = useCallback(() => {
    clearRevealTimer();
    setRevealedFull(null);
  }, [clearRevealTimer]);

  useEffect(() => () => clearRevealTimer(), [clearRevealTimer]);

  const revealed = revealedFull !== null;
  const displayValue = revealedFull ?? maskedValue;

  async function handleReveal(event?: MouseEvent<HTMLButtonElement>) {
    event?.stopPropagation();
    event?.preventDefault();

    if (revealed) {
      hideAccountNumber();
      return;
    }

    let full = fullValue;
    if (!full) {
      setLoading(true);
      setReauthRequired(false);
      try {
        if (onRevealRequest) {
          full = (await onRevealRequest()) ?? undefined;
        } else if (token) {
          full = await fetchPaystackAccountNumber(token);
        }
      } catch (error) {
        if (isReauthenticationRequiredError(error)) {
          setReauthRequired(true);
        }
        return;
      } finally {
        setLoading(false);
      }
    }

    if (!full) return;

    setRevealedFull(full);
    clearRevealTimer();
    timerRef.current = window.setTimeout(() => {
      hideAccountNumber();
    }, revealDurationMs);
  }

  const canReveal = Boolean(fullValue || token || onRevealRequest);
  const signInHref = `/sign-in?returnTo=${encodeURIComponent(pathname)}`;

  return (
    <span className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <span className="inline-flex items-center gap-1.5">
        <span className={mono ? "font-mono tracking-[0.12em]" : undefined}>{displayValue}</span>
        {canReveal && (
          <button
            type="button"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-brand-600 transition hover:bg-brand-50 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={(event) => void handleReveal(event)}
            disabled={loading}
            aria-label={revealed ? "Hide account number" : "Show full account number"}
            aria-pressed={revealed}
            title={revealed ? "Hide account number" : "Show full account number for 5 seconds"}
          >
            {loading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-300 border-t-brand-700" />
            ) : revealed ? (
              <EyeSlashIcon />
            ) : (
              <EyeIcon />
            )}
          </button>
        )}
      </span>
      {reauthRequired && (
        <span className="text-xs text-amber-800">
          Sign in again to view your payout account number.{" "}
          <Link href={signInHref} className="font-medium underline underline-offset-2">
            Sign in
          </Link>
        </span>
      )}
    </span>
  );
}

export function RevealableAccountNumber(props: RevealableAccountNumberProps) {
  const maskedValue = displayMaskedAccount(props.value);

  return <RevealableAccountNumberInner key={maskedValue} {...props} maskedValue={maskedValue} />;
}

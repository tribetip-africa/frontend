"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getDisplayMessage, isTribetipError } from "@/lib/errors";
import type { AfricanMarket } from "@/lib/constants";
import { defaultMarket, enabledMarkets } from "@/lib/region-flags";
import { Button } from "@/components/ui/button";

type Field = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
};

type AuthFormProps = {
  mode: "sign-up" | "sign-in";
  onSubmit: (values: Record<string, string>) => Promise<void>;
  defaultUsername?: string;
  defaultReferralCode?: string;
  lockedEmail?: string;
};

export function AuthForm({
  mode,
  onSubmit,
  defaultUsername = "",
  defaultReferralCode = "",
  lockedEmail,
}: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signupMarkets = enabledMarkets();
  const [countryCode, setCountryCode] = useState(defaultMarket().code);

  const selectedMarket =
    signupMarkets.find((market) => market.code === countryCode) ?? defaultMarket();

  const fields: Field[] =
    mode === "sign-up"
      ? [
          { name: "username", label: "Username", autoComplete: "username", required: true },
          { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
          {
            name: "password",
            label: "Password",
            type: "password",
            autoComplete: "new-password",
            required: true,
          },
          {
            name: "password_confirmation",
            label: "Confirm password",
            type: "password",
            autoComplete: "new-password",
            required: true,
          },
        ]
      : [
          {
            name: "login",
            label: "Email or username",
            autoComplete: "username",
            required: true,
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            autoComplete: "current-password",
            required: true,
          },
        ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const values: Record<string, string> = {};
    formData.forEach((value, key) => {
      values[key] = String(value);
    });

    if (mode === "sign-up") {
      const selectEl = event.currentTarget.elements.namedItem(
        "country_code",
      ) as HTMLSelectElement | null;
      const code = selectEl?.value || countryCode;
      const market = signupMarkets.find((entry) => entry.code === code) ?? selectedMarket;
      values.country_code = market.code;
      values.currency = market.currency;
    }

    try {
      await onSubmit(values);
    } catch (err) {
      setError(getDisplayMessage(err));
      if (process.env.NODE_ENV === "development" && isTribetipError(err)) {
        console.warn("[TribetipError]", err.toJSON());
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {mode === "sign-up" && signupMarkets.length > 1 && (
        <div>
          <label htmlFor="country_code" className="mb-1 block text-sm font-medium text-brand-800">
            Your market
          </label>
          <select
            id="country_code"
            name="country_code"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value as AfricanMarket["code"])}
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none ring-accent focus:border-accent focus:ring-2 focus:ring-accent/30"
          >
            {signupMarkets.map((market) => (
              <option key={market.code} value={market.code}>
                {market.flag} {market.name} ({market.currency})
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === "sign-up" && signupMarkets.length === 1 && (
        <>
          <input type="hidden" name="country_code" value={selectedMarket.code} />
          <p className="rounded-xl border border-brand-100 bg-brand-50/70 px-3 py-2.5 text-sm text-brand-800">
            Launch market:{" "}
            <span className="font-medium">
              {selectedMarket.flag} {selectedMarket.name} ({selectedMarket.currency})
            </span>
          </p>
        </>
      )}

      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-brand-800">
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type ?? "text"}
            autoComplete={field.autoComplete}
            required={field.required}
            readOnly={field.name === "email" && Boolean(lockedEmail)}
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none ring-accent placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30 read-only:bg-brand-50/80 read-only:text-brand-800"
            defaultValue={
              field.name === "username"
                ? defaultUsername
                : field.name === "email" && lockedEmail
                  ? lockedEmail
                  : undefined
            }
            placeholder={
              field.name === "username"
                ? "e.g. ama_creates"
                : field.name === "login"
                  ? "you@email.com or your_username"
                  : undefined
            }
          />
          {field.name === "username" && (
            <p className="mt-1 text-xs text-brand-600/80">
              Lowercase letters, numbers, and underscores only (3–30 chars).
            </p>
          )}
          {field.name === "email" && (
            <p className="mt-1 text-xs text-brand-600/80">
              {lockedEmail
                ? "This email is fixed to your early access invite."
                : "Use a real email Paystack accepts (e.g. you@gmail.com). Test domains like .local won't work for payouts."}
            </p>
          )}
        </div>
      ))}

      {mode === "sign-up" && (
        <div>
          <label htmlFor="referral_code" className="mb-1 block text-sm font-medium text-brand-800">
            Referral code <span className="font-normal text-brand-600">(optional)</span>
          </label>
          <input
            id="referral_code"
            name="referral_code"
            type="text"
            autoComplete="off"
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none ring-accent placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30"
            defaultValue={defaultReferralCode}
            placeholder="Paste a link code or @username"
          />
          <p className="mt-1 text-xs text-brand-600/80">
            Have a friend&apos;s invite link or code? Paste it here. Leave blank if you don&apos;t have one.
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait…" : mode === "sign-up" ? "Start my page" : "Log in"}
      </Button>

      <p className="text-center text-sm text-brand-700">
        {mode === "sign-up" ? (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-brand-600 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/sign-up" className="font-semibold text-brand-600 hover:underline">
              Create your page
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

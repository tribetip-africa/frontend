"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ApiRequestError } from "@/lib/api";
import { AFRICAN_MARKETS } from "@/lib/constants";
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
};

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("NG");

  const selectedMarket = AFRICAN_MARKETS.find((m) => m.code === countryCode) ?? AFRICAN_MARKETS[0];

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
          { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
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
      values.country_code = countryCode;
      values.currency = selectedMarket.currency;
    }

    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "sign-up" && (
        <div>
          <label htmlFor="country_code" className="mb-1.5 block text-sm font-medium text-brand-800">
            Your market
          </label>
          <select
            id="country_code"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-900 outline-none ring-brand-500 focus:ring-2"
          >
            {AFRICAN_MARKETS.map((market) => (
              <option key={market.code} value={market.code}>
                {market.flag} {market.name} ({market.currency})
              </option>
            ))}
          </select>
        </div>
      )}

      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-brand-800">
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type ?? "text"}
            autoComplete={field.autoComplete}
            required={field.required}
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-900 outline-none ring-brand-500 placeholder:text-brand-400 focus:ring-2"
            placeholder={
              field.name === "username" ? "e.g. ama_creates" : undefined
            }
          />
          {field.name === "username" && (
            <p className="mt-1 text-xs text-brand-600/80">
              Lowercase letters, numbers, and underscores only (3–30 chars).
            </p>
          )}
        </div>
      ))}

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait…" : mode === "sign-up" ? "Create my page" : "Sign in"}
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

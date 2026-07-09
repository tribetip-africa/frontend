"use client";

import { FormEvent, useState } from "react";
import { enabledMarkets } from "@/lib/region-flags";
import { Button } from "@/components/ui/button";

type WaitlistFormProps = {
  source?: string;
};

export function WaitlistForm({ source = "waitlist-page" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState("creator");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const markets = enabledMarkets();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          country,
          role,
          source,
          website,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-6 text-center">
        <p className="font-display text-xl font-extrabold text-ink">You&apos;re on the list</p>
        <p className="mt-2 text-sm text-ink-soft">
          We&apos;ll email you when TribeTip opens in your market. Thanks for your interest.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="waitlist-email" className="text-sm font-semibold text-ink">
          Email
        </label>
        <input
          id="waitlist-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200/70"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="waitlist-name" className="text-sm font-semibold text-ink">
          Name <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="waitlist-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200/70"
          placeholder="Ama Creates"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="waitlist-country" className="text-sm font-semibold text-ink">
            Country
          </label>
          <select
            id="waitlist-country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200/70"
          >
            <option value="">Select country</option>
            {markets.map((market) => (
              <option key={market.code} value={market.code}>
                {market.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="waitlist-role" className="text-sm font-semibold text-ink">
            I am a
          </label>
          <select
            id="waitlist-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200/70"
          >
            <option value="creator">Creator</option>
            <option value="supporter">Supporter / fan</option>
            <option value="partner">Partner / press</option>
          </select>
        </div>
      </div>

      <input
        type="text"
        name="website"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      {error && (
        <p className="text-sm text-coral" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" className="w-full py-3.5 text-base" disabled={loading}>
        {loading ? "Joining…" : "Join waitlist"}
      </Button>
    </form>
  );
}

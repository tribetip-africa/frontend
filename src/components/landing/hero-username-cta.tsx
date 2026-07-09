"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { primaryLaunchCta, showWaitlist } from "@/lib/launch-mode";
import { getPlatformHostLabel } from "@/lib/platform";

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

export function HeroUsernameCta() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const launchCta = primaryLaunchCta();

  if (showWaitlist() && launchCta) {
    return (
      <div className="w-full max-w-xl">
        <Link href={launchCta.href}>
          <Button variant="primary" className="w-full px-8 py-4 text-base sm:w-auto">
            {launchCta.label}
          </Button>
        </Link>
      </div>
    );
  }

  if (!launchCta) {
    return (
      <div className="w-full max-w-xl rounded-2xl border border-line bg-surface px-5 py-5">
        <p className="font-display text-xl font-extrabold text-ink">Launching soon</p>
        <p className="mt-2 text-sm text-ink-soft">
          TribeTip is opening creator sign-ups in waves across Africa. Check back shortly or follow
          us for updates.
        </p>
      </div>
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = username.trim().toLowerCase();

    if (!USERNAME_PATTERN.test(value)) {
      setError("Use 3–30 lowercase letters, numbers, or underscores.");
      return;
    }

    setError(null);
    router.push(`/sign-up?username=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-full border-2 border-line bg-surface shadow-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200/70">
          <span className="hidden shrink-0 pl-5 text-sm text-muted sm:inline">
            {getPlatformHostLabel()}/
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
              setError(null);
            }}
            placeholder="yourname"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-base font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted sm:py-4 sm:pl-2"
            aria-label="Choose your username"
          />
        </div>
        <Button type="submit" variant="primary" className="shrink-0 px-8 py-4 text-base">
          Start my page
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-coral" role="alert">
          {error}
        </p>
      )}
      <p className="mt-3 text-sm text-muted">
        It&apos;s free and takes less than a minute!
      </p>
    </form>
  );
}

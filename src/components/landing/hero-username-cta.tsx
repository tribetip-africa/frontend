"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getPlatformHostLabel } from "@/lib/platform";

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

export function HeroUsernameCta() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

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
        <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-full border-2 border-line bg-white shadow-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
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

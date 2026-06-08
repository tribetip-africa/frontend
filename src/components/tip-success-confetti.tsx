"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { fireConfetti } from "@/lib/confetti";

type TipSuccessConfettiProps = {
  active: boolean;
  celebrationKey?: string;
};

const celebratedKeys = new Set<string>();

function cleanSuccessQueryFromUrl(): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  if (
    !url.searchParams.has("tip") &&
    !url.searchParams.has("reference") &&
    !url.searchParams.has("trxref")
  ) {
    return;
  }

  url.searchParams.delete("tip");
  url.searchParams.delete("reference");
  url.searchParams.delete("trxref");

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

export function TipSuccessConfetti({ active, celebrationKey }: TipSuccessConfettiProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!active) {
      return;
    }

    const celebrationId = celebrationKey ?? `${pathname}:tip-success`;
    if (celebratedKeys.has(celebrationId)) {
      cleanSuccessQueryFromUrl();
      return;
    }

    celebratedKeys.add(celebrationId);
    fireConfetti();
    cleanSuccessQueryFromUrl();
  }, [active, celebrationKey, pathname]);

  return null;
}

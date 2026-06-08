"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicTipHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/80 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-brand-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm text-white">
            T
          </span>
          <span className="text-lg tracking-tight">TribeTip</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden sm:block">
            <Button variant="ghost" type="button">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button type="button">Start your page</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function PublicTipHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href="/" size="md" />

        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden sm:block">
            <Button variant="ghost" type="button">
              Log in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="primary" type="button">
              Start my page
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { isSignInOpen, isSignupOpen, primaryLaunchCta } from "@/lib/launch-mode";

export function PublicTipHeader() {
  const signupOpen = isSignupOpen();
  const signInOpen = isSignInOpen();
  const launchCta = primaryLaunchCta();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href="/" size="md" />

        <div className="flex items-center gap-2">
          {signInOpen && (
            <Link href="/sign-in" className="hidden sm:block">
              <Button variant="ghost" type="button">
                Log in
              </Button>
            </Link>
          )}
          {signupOpen ? (
            <Link href="/sign-up">
              <Button variant="primary" type="button">
                Start my page
              </Button>
            </Link>
          ) : launchCta ? (
            <Link href={launchCta.href}>
              <Button variant="primary" type="button">
                {launchCta.label}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

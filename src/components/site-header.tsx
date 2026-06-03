"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { tribe, isLoading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/80 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-brand-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm text-white">
            T
          </span>
          <span className="text-lg tracking-tight">TribeTip</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-brand-800/90 md:flex">
          <a href="#how-it-works" className="hover:text-brand-600">
            How it works
          </a>
          <a href="#markets" className="hover:text-brand-600">
            Markets
          </a>
          <a href="#creators" className="hover:text-brand-600">
            For creators
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {!isLoading && tribe ? (
            <>
              <Link
                href="/dashboard"
                className="hidden text-sm font-medium text-brand-800 hover:text-brand-600 sm:inline"
              >
                Dashboard
              </Link>
              <Button variant="ghost" type="button" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hidden sm:block">
                <Button variant="ghost" type="button">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button type="button">Start free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

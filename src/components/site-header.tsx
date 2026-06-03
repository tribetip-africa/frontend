"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getCreatorPageUrl } from "@/lib/platform";
import { Button } from "@/components/ui/button";

const LANDING_NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#markets", label: "Markets" },
  { href: "/#creators", label: "For creators" },
] as const;

function navLinkClass(isActive: boolean) {
  return isActive
    ? "text-brand-600"
    : "text-brand-800/90 hover:text-brand-600";
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { tribe, isLoading, signOut } = useAuth();
  const isAuthenticated = !isLoading && !!tribe;

  const handleSignOut = () => {
    signOut().then(() => router.replace("/"));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/80 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-semibold text-brand-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm text-white">
            T
          </span>
          <span className="text-lg tracking-tight">TribeTip</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={navLinkClass(pathname === "/dashboard")}
              >
                Dashboard
              </Link>
              <Link
                href={getCreatorPageUrl(tribe.username)}
                className={navLinkClass(pathname === `/${tribe.username}`)}
              >
                My page
              </Link>
              <span className="text-brand-600/80">@{tribe.username}</span>
            </>
          ) : (
            LANDING_NAV.map(({ href, label }) => (
              <Link key={href} href={href} className={navLinkClass(false)}>
                {label}
              </Link>
            ))
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium md:hidden ${navLinkClass(pathname === "/dashboard")}`}
              >
                Dashboard
              </Link>
              <Button variant="ghost" type="button" onClick={handleSignOut}>
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

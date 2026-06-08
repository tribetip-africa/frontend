"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { fetchMyProfile } from "@/lib/api";
import { canAccessCreatorPublicPage } from "@/lib/creator-public-page";
import { getCreatorPageUrl } from "@/lib/platform";
import { isAdminRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import type { CreatorProfile } from "@/types/api";

const LOCKED_PAGE_HINT =
  "Publish your page and complete payout verification to unlock your public tip link.";

const LANDING_NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#markets", label: "Markets" },
  { href: "/#creators", label: "For creators" },
] as const;

function navLinkClass(isActive: boolean) {
  return isActive ? "text-brand-600" : "text-brand-800/90 hover:text-brand-600";
}

function isDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { tribe, token, isLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);

  const isAuthenticated = !isLoading && !!tribe;
  const isAdmin = isAuthenticated && isAdminRole(tribe.role);
  const publicPageShareable =
    isAuthenticated && !isAdmin && canAccessCreatorPublicPage(tribe, profile);

  useEffect(() => {
    if (!token || !tribe || isAdmin) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    fetchMyProfile(token)
      .then((loaded) => {
        if (!cancelled) setProfile(loaded);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [token, tribe, isAdmin]);

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
              <Link href="/dashboard" className={navLinkClass(isDashboardPath(pathname))}>
                Dashboard
              </Link>
              {!isAdmin &&
                (publicPageShareable ? (
                  <Link
                    href={getCreatorPageUrl(tribe.username)}
                    className={navLinkClass(pathname === `/${tribe.username}`)}
                  >
                    My page
                  </Link>
                ) : (
                  <span
                    className="cursor-not-allowed text-brand-400"
                    title={LOCKED_PAGE_HINT}
                  >
                    My page
                  </span>
                ))}
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
                className={`text-sm font-medium md:hidden ${navLinkClass(isDashboardPath(pathname))}`}
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

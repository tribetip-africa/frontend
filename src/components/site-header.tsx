"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useAuth } from "@/context/auth-context";
import { fetchMyProfile } from "@/lib/api";
import { canAccessCreatorPublicPage, LOCKED_PAGE_HINT } from "@/lib/creator-public-page";
import { isSignInOpen, isSignupOpen, primaryLaunchCta } from "@/lib/launch-mode";
import { getCreatorPageUrl } from "@/lib/platform";
import { isAdminRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import type { CreatorProfile } from "@/types/api";

const LANDING_NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#growth-tools", label: "Grow" },
  { href: "/#creators", label: "For creators" },
  { href: "/#markets", label: "Markets" },
  { href: "/faq", label: "FAQ" },
] as const;

function navLinkClass(isActive: boolean) {
  return isActive
    ? "font-semibold text-ink"
    : "text-ink-soft hover:text-ink transition-colors";
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
  const shouldLoadProfile = Boolean(token && tribe && !isAdmin);
  const effectiveProfile = shouldLoadProfile ? profile : null;
  const publicPageShareable =
    isAuthenticated && !isAdmin && canAccessCreatorPublicPage(tribe, effectiveProfile);
  const onDashboard = isDashboardPath(pathname);
  const launchCta = primaryLaunchCta();
  const signupOpen = isSignupOpen();
  const signInOpen = isSignInOpen();

  useEffect(() => {
    if (!shouldLoadProfile || !token) return;

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
  }, [token, shouldLoadProfile]);

  const handleSignOut = () => {
    signOut().then(() => router.replace("/"));
  };

  if (onDashboard) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href={isAuthenticated ? "/dashboard" : "/"} size="md" />

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
                  <span className="cursor-not-allowed text-muted" title={LOCKED_PAGE_HINT}>
                    My page
                  </span>
                ))}
            </>
          ) : (
            LANDING_NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={navLinkClass(href.startsWith("/") && !href.includes("#") && pathname === href)}
              >
                {label}
              </Link>
            ))
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-muted sm:inline">@{tribe.username}</span>
              <Button variant="ghost" type="button" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : signupOpen ? (
            <>
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
            </>
          ) : (
            <>
              {signInOpen && (
                <Link href="/sign-in" className="hidden sm:block">
                  <Button variant="ghost" type="button">
                    Log in
                  </Button>
                </Link>
              )}
              {launchCta ? (
                <Link href={launchCta.href}>
                  <Button variant="primary" type="button">
                    {launchCta.label}
                  </Button>
                </Link>
              ) : (
                <span className="hidden rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted sm:inline">
                  Launching soon
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

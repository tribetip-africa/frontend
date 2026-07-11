"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { clearStoredAuth, getStoredTribe } from "@/lib/auth-storage";
import { isUnauthorizedError, validateStoredSession } from "@/lib/auth-session";
import { isMarketingPath, isProtectedPath } from "@/lib/protected-routes";

type AuthGateProps = {
  children: React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isAuthenticated, isLoading } = useAuth();
  const [checking, setChecking] = useState(false);
  const [validatedSessionKey, setValidatedSessionKey] = useState<string | null>(null);
  const sessionKey = isAuthenticated ? (token ?? "cookie") : null;
  const validated = sessionKey !== null && validatedSessionKey === sessionKey;
  const redirectAttempted = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !sessionKey) {
      return;
    }

    if (validated) {
      if (isMarketingPath(pathname) && getStoredTribe() && !redirectAttempted.current) {
        redirectAttempted.current = true;
        router.replace("/dashboard");
      }
      return;
    }

    let cancelled = false;

    void (async () => {
      setChecking(true);

      try {
        await validateStoredSession(token);
        if (cancelled) return;

        setValidatedSessionKey(sessionKey);

        if (isMarketingPath(pathname)) {
          redirectAttempted.current = true;
          router.replace("/dashboard");
        }
      } catch (error) {
        if (cancelled) return;

        if (isUnauthorizedError(error)) {
          setValidatedSessionKey(null);
          clearStoredAuth();
          router.replace("/");
          return;
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, sessionKey, token, pathname, router, validated]);

  useEffect(() => {
    redirectAttempted.current = false;
  }, [pathname]);

  const sessionPendingValidation = isAuthenticated && !validated;
  const needsAuthBootstrap =
    isProtectedPath(pathname) || (isMarketingPath(pathname) && isAuthenticated);

  const shouldBlock =
    (isLoading && needsAuthBootstrap) ||
    checking ||
    (sessionPendingValidation && needsAuthBootstrap);

  if (shouldBlock) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-700">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}

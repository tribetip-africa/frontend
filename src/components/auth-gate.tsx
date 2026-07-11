"use client";

import { useEffect, useState } from "react";
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
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      setValidated(false);
      return;
    }

    if (validated) {
      if (isMarketingPath(pathname) && getStoredTribe()) {
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

        setValidated(true);

        if (isMarketingPath(pathname)) {
          router.replace("/dashboard");
        }
      } catch (error) {
        if (cancelled) return;

        if (isUnauthorizedError(error)) {
          setValidated(false);
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
  }, [isLoading, isAuthenticated, token, pathname, router, validated]);

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

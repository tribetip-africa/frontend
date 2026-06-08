"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { clearStoredAuth, getStoredTribe, setStoredAuth } from "@/lib/auth-storage";
import { isUnauthorizedError, validateStoredSession } from "@/lib/auth-session";
import {
  isMarketingPath,
  isProtectedPath,
  normalizeAuthRedirectPath,
} from "@/lib/protected-routes";

type AuthGateProps = {
  children: React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isLoading } = useAuth();
  const [checking, setChecking] = useState(false);
  const validatedToken = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      validatedToken.current = null;
      setChecking(false);
      return;
    }

    if (validatedToken.current === token) {
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

        validatedToken.current = token;

        if (isMarketingPath(pathname)) {
          router.replace("/dashboard");
        }
      } catch (error) {
        if (cancelled) return;

        if (isUnauthorizedError(error)) {
          validatedToken.current = null;
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
  }, [isLoading, token, pathname, router]);

  const sessionPendingValidation =
    Boolean(token) && validatedToken.current !== token;

  const shouldBlock =
    isLoading ||
    checking ||
    (sessionPendingValidation &&
      (isProtectedPath(pathname) || isMarketingPath(pathname)));

  if (shouldBlock) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-700">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}

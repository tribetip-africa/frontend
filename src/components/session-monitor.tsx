"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { refreshSession } from "@/lib/api";
import { clearStoredAuth, getStoredToken, setStoredAuth } from "@/lib/auth-storage";
import { isTokenExpired, tokenExpiresWithinMs } from "@/lib/jwt-payload";
import { isProtectedPath } from "@/lib/protected-routes";

const SESSION_CHECK_MS = 60_000;
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const REFRESH_WITHIN_MS = 10 * 60 * 1000;
const LAST_ACTIVITY_KEY = "tribetip_last_activity_ms";

function readLastActivityMs(): number {
  if (typeof window === "undefined") return Date.now();
  const raw = window.sessionStorage.getItem(LAST_ACTIVITY_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function touchActivity(nowMs: number = Date.now()) {
  window.sessionStorage.setItem(LAST_ACTIVITY_KEY, String(nowMs));
}

export function SessionMonitor() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    touchActivity();

    const onActivity = () => touchActivity();
    const events: Array<keyof WindowEventMap> = ["click", "keydown", "mousemove", "touchstart", "scroll"];

    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));

    const intervalId = window.setInterval(() => {
      const token = getStoredToken();
      if (!token) return;

      const now = Date.now();
      const idleForMs = now - readLastActivityMs();

      if (isTokenExpired(token, now) || idleForMs >= IDLE_TIMEOUT_MS) {
        clearStoredAuth();
        if (isProtectedPath(pathname)) {
          router.replace("/sign-in");
        }
        return;
      }

      if (!tokenExpiresWithinMs(token, REFRESH_WITHIN_MS, now)) return;

      void refreshSession(token)
        .then(({ data, token: nextToken }) => {
          if (data.tribe) {
            setStoredAuth(nextToken, data.tribe);
          }
        })
        .catch(() => {
          // Keep the current session until the token actually expires.
        });
    }, SESSION_CHECK_MS);

    return () => {
      events.forEach((event) => window.removeEventListener(event, onActivity));
      window.clearInterval(intervalId);
    };
  }, [pathname, router]);

  return null;
}

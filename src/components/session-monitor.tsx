"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { refreshSession, signOut as apiSignOut } from "@/lib/api";
import { isCookieAuthEnabled } from "@/lib/auth-mode";
import {
  clearStoredAuth,
  getStoredToken,
  getStoredTribe,
  setStoredAuth,
} from "@/lib/auth-storage";
import { isTokenExpired, tokenExpiresWithinMs } from "@/lib/jwt-payload";
import { isProtectedPath } from "@/lib/protected-routes";

const SESSION_CHECK_MS = 60_000;
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const REFRESH_WITHIN_MS = 10 * 60 * 1000;
const COOKIE_REFRESH_INTERVAL_MS = 2 * 60 * 60 * 1000;
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

async function endSession(token: string | null) {
  try {
    await apiSignOut(token);
  } catch {
    // Always clear local state even if the API sign-out fails.
  }
  clearStoredAuth();
}

export function SessionMonitor() {
  const router = useRouter();
  const pathname = usePathname();
  const lastCookieRefreshMs = useRef(0);

  useEffect(() => {
    touchActivity();

    const onActivity = () => touchActivity();
    const events: Array<keyof WindowEventMap> = ["click", "keydown", "mousemove", "touchstart", "scroll"];

    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));

    const intervalId = window.setInterval(() => {
      const cookieMode = isCookieAuthEnabled();
      const token = getStoredToken();
      const tribe = getStoredTribe();

      if (!tribe && !token) return;

      const now = Date.now();
      const idleForMs = now - readLastActivityMs();

      if (idleForMs >= IDLE_TIMEOUT_MS) {
        void endSession(token).then(() => {
          if (isProtectedPath(pathname)) {
            router.replace("/sign-in");
          }
        });
        return;
      }

      if (cookieMode) {
        if (now - lastCookieRefreshMs.current < COOKIE_REFRESH_INTERVAL_MS) return;
        lastCookieRefreshMs.current = now;

        void refreshSession(token)
          .then(({ data, token: nextToken }) => {
            if (data.tribe) {
              setStoredAuth(nextToken, data.tribe);
            }
          })
          .catch(() => {
            // Keep the current session until the API rejects the cookie.
          });
        return;
      }

      if (!token) return;

      if (isTokenExpired(token, now)) {
        void endSession(token).then(() => {
          if (isProtectedPath(pathname)) {
            router.replace("/sign-in");
          }
        });
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

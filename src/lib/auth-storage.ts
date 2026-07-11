import type { Tribe } from "@/types/api";
import { isCookieAuthEnabled } from "@/lib/auth-mode";
import { clearCsrfToken } from "@/lib/csrf-storage";
import { clearAuthSessionCookie, setAuthSessionCookie } from "@/lib/auth-cookie";

const TOKEN_KEY = "tribetip_token";
const TRIBE_KEY = "tribetip_tribe";

export type StoredTribe = {
  id: string;
  email: string;
  username: string;
  role: Tribe["role"];
  account_status: Tribe["account_status"];
  paystack_onboarding: Tribe["paystack_onboarding"];
  public_page_shareable?: boolean;
};

export type AuthStorageSnapshot = {
  token: string | null;
  tribe: StoredTribe | null;
};

const listeners = new Set<() => void>();

export function subscribeAuthStorage(onChange: () => void) {
  listeners.add(onChange);

  const onStorage = (event: StorageEvent) => {
    if (event.key === TOKEN_KEY || event.key === TRIBE_KEY) {
      onChange();
    }
  };

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function notifyAuthStorageChange() {
  listeners.forEach((listener) => listener());
}

const EMPTY_AUTH_SNAPSHOT: AuthStorageSnapshot = { token: null, tribe: null };

let cachedSnapshot: AuthStorageSnapshot = EMPTY_AUTH_SNAPSHOT;

function tribesEqual(a: StoredTribe | null, b: StoredTribe | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.email === b.email &&
    a.username === b.username &&
    a.role === b.role &&
    a.account_status === b.account_status &&
    a.paystack_onboarding.complete === b.paystack_onboarding.complete &&
    a.paystack_onboarding.customer_ready === b.paystack_onboarding.customer_ready &&
    a.paystack_onboarding.subaccount_ready === b.paystack_onboarding.subaccount_ready &&
    (a.paystack_onboarding.subaccount_verified ?? false) ===
      (b.paystack_onboarding.subaccount_verified ?? false) &&
    a.public_page_shareable === b.public_page_shareable
  );
}

function normalizeStoredTribe(raw: Record<string, unknown>): StoredTribe | null {
  const id = raw.id;
  const email = raw.email;
  const username = raw.username;
  if (typeof id !== "string" || typeof email !== "string" || typeof username !== "string") {
    return null;
  }

  const role = raw.role === "admin" ? "admin" : "creator";
  const accountStatus =
    raw.account_status === "active" || raw.account_status === "suspended"
      ? raw.account_status
      : "pending";

  const onboardingRaw = raw.paystack_onboarding;
  const paystackOnboarding =
    onboardingRaw &&
    typeof onboardingRaw === "object" &&
    typeof (onboardingRaw as { complete?: unknown }).complete === "boolean"
      ? {
          customer_ready: (onboardingRaw as { customer_ready?: boolean }).customer_ready === true,
          subaccount_ready: (onboardingRaw as { subaccount_ready?: boolean }).subaccount_ready === true,
          complete: (onboardingRaw as { complete: boolean }).complete,
          subaccount_verified:
            (onboardingRaw as { subaccount_verified?: boolean }).subaccount_verified === true ||
            (onboardingRaw as { payout?: { subaccount_verified?: boolean } }).payout
              ?.subaccount_verified === true,
        }
      : {
          customer_ready: false,
          subaccount_ready: false,
          complete: false,
          subaccount_verified: false,
        };

  return {
    id,
    email,
    username,
    role,
    account_status: accountStatus,
    paystack_onboarding: paystackOnboarding,
    public_page_shareable:
      (raw as { public_page_shareable?: boolean }).public_page_shareable === true,
  };
}

function clearLegacyTokenStorage() {
  if (typeof window === "undefined" || !isCookieAuthEnabled()) return;
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticatedSnapshot(snapshot: AuthStorageSnapshot = getAuthStorageSnapshot()): boolean {
  if (!snapshot.tribe) return false;
  if (isCookieAuthEnabled()) return true;
  return Boolean(snapshot.token);
}

export function getAuthStorageSnapshot(): AuthStorageSnapshot {
  clearLegacyTokenStorage();

  const token = isCookieAuthEnabled() ? null : getStoredToken();
  const tribe = getStoredTribe();

  if (tribe && (token || isCookieAuthEnabled())) {
    setAuthSessionCookie();

    if (cachedSnapshot.token === token && tribesEqual(cachedSnapshot.tribe, tribe)) {
      return cachedSnapshot;
    }

    cachedSnapshot = { token, tribe };
    return cachedSnapshot;
  }

  if (cachedSnapshot.token === null && cachedSnapshot.tribe === null) {
    return EMPTY_AUTH_SNAPSHOT;
  }

  cachedSnapshot = EMPTY_AUTH_SNAPSHOT;
  return EMPTY_AUTH_SNAPSHOT;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined" || isCookieAuthEnabled()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string | null, tribe: StoredTribe | Record<string, unknown>) {
  const normalized = normalizeStoredTribe(tribe as Record<string, unknown>);
  if (!normalized) {
    return;
  }

  const existingToken = getStoredToken();
  const existingTribe = getStoredTribe();
  const nextToken = isCookieAuthEnabled() ? null : token;

  if (existingToken === nextToken && tribesEqual(existingTribe, normalized)) {
    return;
  }

  if (!isCookieAuthEnabled() && token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else if (isCookieAuthEnabled()) {
    localStorage.removeItem(TOKEN_KEY);
  }

  localStorage.setItem(TRIBE_KEY, JSON.stringify(normalized));
  setAuthSessionCookie();
  notifyAuthStorageChange();
}

export function getStoredTribe(): StoredTribe | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TRIBE_KEY);
  if (!raw) return null;
  try {
    return normalizeStoredTribe(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TRIBE_KEY);
  clearAuthSessionCookie();
  clearCsrfToken();
  notifyAuthStorageChange();
}

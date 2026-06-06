import type { Tribe } from "@/types/api";
import { clearAuthSessionCookie, setAuthSessionCookie } from "@/lib/auth-cookie";

const TOKEN_KEY = "tribetip_token";
const TRIBE_KEY = "tribetip_tribe";

export type StoredTribe = {
  id: string;
  email: string;
  username: string;
  role: Tribe["role"];
  account_status: Tribe["account_status"];
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
    a.account_status === b.account_status
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

  return {
    id,
    email,
    username,
    role,
    account_status: accountStatus,
  };
}

export function getAuthStorageSnapshot(): AuthStorageSnapshot {
  const token = getStoredToken();
  const tribe = getStoredTribe();

  if (token && tribe) {
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
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, tribe: StoredTribe) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TRIBE_KEY, JSON.stringify(tribe));
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
  notifyAuthStorageChange();
}

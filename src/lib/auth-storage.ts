const TOKEN_KEY = "tribetip_token";
const TRIBE_KEY = "tribetip_tribe";

export type StoredTribe = { id: string; email: string; username: string };

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
  return a.id === b.id && a.email === b.email && a.username === b.username;
}

export function getAuthStorageSnapshot(): AuthStorageSnapshot {
  const token = getStoredToken();
  const tribe = getStoredTribe();

  if (token && tribe) {
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
  notifyAuthStorageChange();
}

export function getStoredTribe(): StoredTribe | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TRIBE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredTribe;
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TRIBE_KEY);
  notifyAuthStorageChange();
}

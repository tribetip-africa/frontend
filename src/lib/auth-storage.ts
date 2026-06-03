const TOKEN_KEY = "tribetip_token";
const TRIBE_KEY = "tribetip_tribe";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, tribe: { id: string; email: string; username: string }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TRIBE_KEY, JSON.stringify(tribe));
}

export function getStoredTribe(): { id: string; email: string; username: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TRIBE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; email: string; username: string };
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TRIBE_KEY);
}

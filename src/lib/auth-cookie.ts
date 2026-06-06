export const AUTH_SESSION_COOKIE = "tribetip_session";

export function setAuthSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_SESSION_COOKIE}=1; path=/; max-age=86400; samesite=lax`;
}

export function clearAuthSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function hasAuthSessionCookie(cookieHeader: string | null | undefined): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => part.trim() === `${AUTH_SESSION_COOKIE}=1`);
}

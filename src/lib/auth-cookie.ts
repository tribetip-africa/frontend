export const AUTH_SESSION_COOKIE = "tribetip_session";

// Non-secret presence flag mirroring localStorage auth — not the JWT itself.
// It is intentionally readable by JS (set via document.cookie), so HttpOnly is N/A,
// but it must carry Secure over HTTPS so it is never sent on plaintext requests.
function secureCookieAttribute(): string {
  if (typeof window !== "undefined" && window.location?.protocol === "https:") {
    return "; secure";
  }
  return "";
}

export function hasAuthSessionCookie(cookieHeader: string | null | undefined): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => part.trim() === `${AUTH_SESSION_COOKIE}=1`);
}

export function setAuthSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_SESSION_COOKIE}=1; path=/; max-age=86400; samesite=lax${secureCookieAttribute()}`;
}

export function clearAuthSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_SESSION_COOKIE}=; path=/; max-age=0; samesite=lax${secureCookieAttribute()}`;
}

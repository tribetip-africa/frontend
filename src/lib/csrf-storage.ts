const CSRF_STORAGE_KEY = "tribetip_csrf";

export function storeCsrfToken(token: string | null | undefined) {
  if (typeof window === "undefined" || !token) return;
  window.sessionStorage.setItem(CSRF_STORAGE_KEY, token);
}

export function getCsrfToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(CSRF_STORAGE_KEY);
}

export function clearCsrfToken() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CSRF_STORAGE_KEY);
}

export function csrfHeaders(): HeadersInit {
  const token = getCsrfToken();
  return token ? { "X-CSRF-Token": token } : {};
}

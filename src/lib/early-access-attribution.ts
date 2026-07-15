import { EARLY_ACCESS_TOKEN_PATTERN } from "@/lib/launch-mode";

const STORAGE_KEY = "tribetip_ea_token";

export function normalizeEarlyAccessToken(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return null;
  }

  return EARLY_ACCESS_TOKEN_PATTERN.test(trimmed) ? trimmed : null;
}

export function setEarlyAccessToken(value: string): boolean {
  const token = normalizeEarlyAccessToken(value);
  if (!token || typeof window === "undefined") {
    return false;
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, token);
    return true;
  } catch {
    return false;
  }
}

export function getEarlyAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return normalizeEarlyAccessToken(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function clearEarlyAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

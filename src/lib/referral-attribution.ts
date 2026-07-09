const REFERRAL_COOKIE_NAME = "tribetip_ref";
const REFERRAL_MAX_AGE_DAYS = 30;

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
const INVITE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,48}$/;

export function normalizeReferralCode(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return null;
  }

  if (INVITE_TOKEN_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const username = trimmed.replace(/^@+/, "").toLowerCase();
  return USERNAME_PATTERN.test(username) ? username : null;
}

function maxAgeSeconds(): number {
  return REFERRAL_MAX_AGE_DAYS * 24 * 60 * 60;
}

export function setReferralCode(value: string): boolean {
  const code = normalizeReferralCode(value);
  if (!code || typeof document === "undefined") {
    return false;
  }

  if (getReferralCode()) {
    return false;
  }

  document.cookie = `${REFERRAL_COOKIE_NAME}=${encodeURIComponent(code)}; path=/; max-age=${maxAgeSeconds()}; samesite=lax`;
  return true;
}

export function getReferralCode(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${REFERRAL_COOKIE_NAME}=`;
  const match = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix));

  if (!match) {
    return null;
  }

  return normalizeReferralCode(decodeURIComponent(match.slice(prefix.length)));
}

export function clearReferralCode(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${REFERRAL_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

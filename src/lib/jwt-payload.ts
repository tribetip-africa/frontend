export type JwtPayload = {
  exp?: number;
  iat?: number;
  sub?: string;
};

export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

export function isTokenExpired(token: string, nowMs: number = Date.now()): boolean {
  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs === null) return false;
  return expiryMs <= nowMs;
}

export function tokenExpiresWithinMs(token: string, withinMs: number, nowMs: number = Date.now()): boolean {
  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs === null) return false;
  return expiryMs - nowMs <= withinMs;
}

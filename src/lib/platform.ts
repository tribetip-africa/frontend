export const PLATFORM_DEFAULTS = {
  development: {
    platformUrl: "http://localhost:3000",
    apiUrl: "http://localhost:3001",
  },
  production: {
    platformUrl: "https://tribetip.africa",
    apiUrl: "https://api.tribetip.africa",
  },
} as const;

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function defaultsForEnv() {
  return isProduction() ? PLATFORM_DEFAULTS.production : PLATFORM_DEFAULTS.development;
}

export function getPlatformBaseUrl(): string {
  return normalizeUrl(
    process.env.NEXT_PUBLIC_TRIBETIP_PLATFORM_URL ?? defaultsForEnv().platformUrl,
  );
}

export function getApiBaseUrl(): string {
  return normalizeUrl(process.env.NEXT_PUBLIC_API_URL ?? defaultsForEnv().apiUrl);
}

export function getPlatformHostLabel(): string {
  return new URL(getPlatformBaseUrl()).host;
}

export function getCreatorPageUrl(username: string): string {
  return `${getPlatformBaseUrl()}/${username}`;
}

export function getCreatorPageDisplayUrl(username: string): string {
  const url = getCreatorPageUrl(username);
  return url.replace(/^https?:\/\//, "");
}

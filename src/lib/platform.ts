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
  const configured = normalizeUrl(
    process.env.NEXT_PUBLIC_API_URL ?? defaultsForEnv().apiUrl,
  );

  // localhost and 127.0.0.1 are different sites — cookies (incl. CSRF) only flow on
  // same-site POST when the page host matches the API host.
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    const pageHost = window.location.hostname;
    if (pageHost === "localhost" || pageHost === "127.0.0.1") {
      const url = new URL(configured);
      if (url.hostname !== pageHost) {
        url.hostname = pageHost;
        return normalizeUrl(url.toString());
      }
    }
  }

  return configured;
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

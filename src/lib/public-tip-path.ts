/** Matches API public profile usernames (`/tribes/:username`). */
export const PUBLIC_USERNAME_PATTERN = /^[a-z0-9_]+$/;

export const RESERVED_ROOT_SEGMENTS = new Set([
  "dashboard",
  "sign-in",
  "sign-up",
  "faq",
  "for-creators",
  "terms",
  "privacy",
  "waitlist",
  "early-access",
  "llms",
  "t",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "widget.js",
]);

export function isValidPublicUsername(segment: string): boolean {
  return PUBLIC_USERNAME_PATTERN.test(segment);
}

export function isEmbeddablePublicTipPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return false;
  }

  if (segments[0] === "t" && segments.length === 2) {
    return true;
  }

  return (
    segments.length === 1 &&
    !RESERVED_ROOT_SEGMENTS.has(segments[0]) &&
    isValidPublicUsername(segments[0])
  );
}

export function isBlockedPublicUsernamePath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1 || RESERVED_ROOT_SEGMENTS.has(segments[0])) {
    return false;
  }

  // Allow root text files such as IndexNow keys (e.g. /{key}.txt).
  if (segments[0].endsWith(".txt")) {
    return false;
  }

  return !isValidPublicUsername(segments[0]);
}

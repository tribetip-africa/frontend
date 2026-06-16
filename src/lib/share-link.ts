import { getPlatformBaseUrl } from "@/lib/platform";

export type ShareLink = {
  token: string;
  path: string;
  url: string | null;
  shareable: boolean;
};

const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,48}$/;

export function isValidShareToken(value: string): boolean {
  return SHARE_TOKEN_PATTERN.test(value);
}

export function getSharePagePath(token: string): string {
  return `/t/${token}`;
}

export function getSharePageUrl(token: string): string {
  return `${getPlatformBaseUrl()}${getSharePagePath(token)}`;
}

export function shareLinkHint(shareable: boolean): string {
  if (!shareable) {
    return "Publish your page and complete payout verification to unlock your QR code.";
  }

  return "Supporters can scan this code to tip you without typing your public link.";
}

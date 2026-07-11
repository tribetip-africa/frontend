import type { Metadata } from "next";
import { launchMode } from "@/lib/launch-mode";
import { getPlatformBaseUrl } from "@/lib/platform";

export const SITE_NAME = "TribeTip";

export const DEFAULT_TITLE = "TribeTip — Creator tips for Africa";

export const DEFAULT_DESCRIPTION =
  "Accept tips from your supporters in KES, NGN, GHS, and more. Built for African creators — one link, local payments, payouts that reach your bank.";

export const HOME_DESCRIPTION =
  "Accept tips with M-Pesa, cards, and bank transfers. TribeTip gives African creators one shareable link, local payments in KES, NGN, GHS, and more, and payouts that reach your bank.";

export const DEFAULT_OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

const AUTH_PATHS = ["/sign-in", "/sign-up"] as const;

const ALWAYS_DISALLOWED_ROBOT_PATHS = ["/dashboard/", "/t/"] as const;

export function getSiteUrl(): string {
  return getPlatformBaseUrl();
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export function pageTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

export function getDefaultOgImage(alt = DEFAULT_TITLE, path = "/opengraph-image") {
  return {
    url: path,
    width: DEFAULT_OG_IMAGE_SIZE.width,
    height: DEFAULT_OG_IMAGE_SIZE.height,
    alt,
  };
}

export function buildOpenGraph(input: {
  title: string;
  description: string;
  path?: string;
  imageAlt?: string;
  imagePath?: string;
}) {
  const imagePath = input.imagePath ?? "/opengraph-image";

  return {
    title: input.title,
    description: input.description,
    url: input.path ? absoluteUrl(input.path) : getSiteUrl(),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website" as const,
    images: [getDefaultOgImage(input.imageAlt ?? input.title, imagePath)],
  };
}

export function buildTwitter(input: {
  title: string;
  description: string;
  imageAlt?: string;
  imagePath?: string;
}) {
  const imagePath = input.imagePath ?? "/opengraph-image";

  return {
    card: "summary_large_image" as const,
    title: input.title,
    description: input.description,
    images: [imagePath],
  };
}

export function buildDefaultRobots(): NonNullable<Metadata["robots"]> {
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  };
}

export function buildNoIndexRobots(): NonNullable<Metadata["robots"]> {
  return {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  };
}

export function getRobotsDisallowedPaths(): string[] {
  return [...ALWAYS_DISALLOWED_ROBOT_PATHS, ...AUTH_PATHS];
}

export function getSitemapPaths(): string[] {
  const paths = ["/", "/for-creators", "/faq", "/privacy", "/terms"];

  if (launchMode() === "waitlist") {
    paths.push("/waitlist");
  }

  return paths;
}

function buildSiteVerification(): Metadata["verification"] | undefined {
  const google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim();

  if (!google && !bing) {
    return undefined;
  }

  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}

export function buildRootMetadata(): Metadata {
  const verification = buildSiteVerification();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: DEFAULT_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    alternates: {
      canonical: "/",
    },
    openGraph: buildOpenGraph({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      path: "/",
    }),
    twitter: buildTwitter({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    }),
    robots: buildDefaultRobots(),
    ...(verification ? { verification } : {}),
  };
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  robots?: Metadata["robots"];
  openGraphImagePath?: string;
}): Metadata {
  const socialTitle = pageTitle(input.title);
  const imagePath = input.openGraphImagePath;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: buildOpenGraph({
      title: socialTitle,
      description: input.description,
      path: input.path,
      imagePath,
    }),
    twitter: buildTwitter({
      title: socialTitle,
      description: input.description,
      imagePath,
    }),
    ...(input.robots ? { robots: input.robots } : {}),
  };
}

export function buildHomeMetadata(): Metadata {
  return {
    title: {
      absolute: DEFAULT_TITLE,
    },
    description: HOME_DESCRIPTION,
    alternates: { canonical: "/" },
    openGraph: buildOpenGraph({
      title: DEFAULT_TITLE,
      description: HOME_DESCRIPTION,
      path: "/",
    }),
    twitter: buildTwitter({
      title: DEFAULT_TITLE,
      description: HOME_DESCRIPTION,
    }),
    robots: buildDefaultRobots(),
  };
}

export function buildAuthPageMetadata(input: {
  title: string;
  description: string;
  path: (typeof AUTH_PATHS)[number];
}): Metadata {
  return buildPrivatePageMetadata(input);
}

export function buildPrivatePageMetadata(input: {
  title: string;
  description?: string;
  path: string;
}): Metadata {
  return {
    title: input.title,
    ...(input.description ? { description: input.description } : {}),
    alternates: { canonical: input.path },
    robots: buildNoIndexRobots(),
  };
}

export type CreatorSeoProfile = {
  username: string;
  display_name: string;
  bio: string | null;
  currency: string;
};

export function buildCreatorMetadata(profile: CreatorSeoProfile): Metadata {
  const path = `/${profile.username}`;
  const title = `Tip ${profile.display_name}`;
  const description =
    profile.bio?.trim() ||
    `Support ${profile.display_name} with a secure tip in ${profile.currency} via mobile money or card on TribeTip.`;

  return buildPageMetadata({
    title,
    description,
    path,
    openGraphImagePath: `/${profile.username}/opengraph-image`,
  });
}

export function buildCreatorMetadataFallback(username: string): Metadata {
  return buildPageMetadata({
    title: `@${username}`,
    description: `Send a tip to @${username} on TribeTip with mobile money or card.`,
    path: `/${username}`,
  });
}

const JSON_LD_CONTEXT = "https://schema.org";

function stripJsonLdContext(node: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(node).filter(([key]) => key !== "@context"));
}

export function normalizeJsonLd(
  data: Record<string, unknown> | Record<string, unknown>[],
): Record<string, unknown> {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { "@context": JSON_LD_CONTEXT, "@graph": [] };
    }

    if (data.length === 1) {
      return data[0] as Record<string, unknown>;
    }

    return {
      "@context": JSON_LD_CONTEXT,
      "@graph": data.map((item) => stripJsonLdContext(item)),
    };
  }

  return data;
}

export function serializeJsonLd(data: Record<string, unknown> | Record<string, unknown>[]): string {
  // Escape `<` so creator-controlled strings cannot break out of the ld+json block.
  return JSON.stringify(normalizeJsonLd(data)).replace(/</g, "\\u003c");
}

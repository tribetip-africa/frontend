import type { ReactNode } from "react";
import { FAQ_CATEGORIES, SUPPORT_EMAIL } from "@/lib/faq-content";
import {
  ENTITY_CATEGORY,
  ENTITY_LEGAL_NAME,
  ENTITY_MARKETS,
  ENTITY_PRICING,
  organizationSameAs,
} from "@/lib/entity";
import { faqItemAnchorId } from "@/lib/faq-slug";
import { creatorLocationLabel } from "@/lib/market-label";
import {
  HOME_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  getSiteUrl,
} from "@/lib/seo";

export type CreatorSchemaProfile = {
  username: string;
  display_name: string;
  bio: string | null;
  country_code: string;
  currency: string;
};

function faqAnswerText(answer: ReactNode): string | null {
  return typeof answer === "string" ? answer : null;
}

export function faqSchemaQuestions() {
  return FAQ_CATEGORIES.flatMap((category) =>
    category.items
      .map((item) => {
        const text = faqAnswerText(item.answer);
        if (!text) return null;

        const anchorId = faqItemAnchorId(category.id, item.question);

        return {
          categoryId: category.id,
          anchorId,
          question: item.question,
          answer: text,
          url: absoluteUrl(`/faq#${anchorId}`),
        };
      })
      .filter(
        (
          entry,
        ): entry is {
          categoryId: string;
          anchorId: string;
          question: string;
          answer: string;
          url: string;
        } => entry !== null,
      ),
  );
}

export function buildOrganizationJsonLd() {
  const sameAs = organizationSameAs();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: ENTITY_LEGAL_NAME,
    url: getSiteUrl(),
    logo: absoluteUrl("/icon"),
    description: HOME_DESCRIPTION,
    email: SUPPORT_EMAIL,
    knowsAbout: [
      ENTITY_CATEGORY,
      "Creator monetization",
      "Mobile money payments",
      "M-Pesa",
      ENTITY_MARKETS,
      ENTITY_PRICING,
    ],
    areaServed: {
      "@type": "Continent",
      name: "Africa",
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: HOME_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}

export function buildHomeJsonLd() {
  return [buildOrganizationJsonLd(), buildWebSiteJsonLd()];
}

export function buildWebPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildFaqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSchemaQuestions().map((item) => ({
      "@type": "Question",
      "@id": item.url,
      name: item.question,
      url: item.url,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildCreatorProfileJsonLd(profile: CreatorSchemaProfile) {
  const location = creatorLocationLabel(profile.country_code, profile.country_code);
  const description =
    profile.bio?.trim() ||
    `Support ${profile.display_name} with tips in ${profile.currency} via mobile money or card on TribeTip.`;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `Tip ${profile.display_name} on TribeTip`,
    description,
    url: absoluteUrl(`/${profile.username}`),
    mainEntity: {
      "@type": "Person",
      name: profile.display_name,
      alternateName: profile.username,
      description,
      url: absoluteUrl(`/${profile.username}`),
      homeLocation: {
        "@type": "Place",
        name: location,
      },
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}

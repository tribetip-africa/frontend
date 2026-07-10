import { PLATFORM_FEE_PERCENT, SUPPORT_EMAIL } from "@/lib/faq-content";
import { getPlatformHostLabel } from "@/lib/platform";
import { SITE_NAME, getSiteUrl } from "@/lib/seo";

export const ENTITY_LEGAL_NAME = "TribeTip Africa";

export const ENTITY_CATEGORY = "Creator tipping platform for African creators";

export const ENTITY_DEFINITION =
  "TribeTip is a tipping platform built for African creators. Creators get one shareable link where supporters can send tips with mobile money (such as M-Pesa), cards, or bank transfers — no supporter account required.";

export const ENTITY_AUDIENCE =
  "YouTubers, podcasters, musicians, artists, writers, educators, streamers, and community organisers across Africa.";

export const ENTITY_PAYMENTS =
  "M-Pesa, MTN MoMo, debit and credit cards, and bank transfers through Paystack.";

export const ENTITY_MARKETS =
  "Kenya (live), with Nigeria, Ghana, South Africa, and Côte d'Ivoire rolling out.";

export const ENTITY_PRICING = `Free to start. ${PLATFORM_FEE_PERCENT}% platform fee on tips received. No monthly subscription.`;

export const ENTITY_SUPPORT_EMAIL = SUPPORT_EMAIL;

export function entityCreatorPageExample(username = "your-username"): string {
  return `${getPlatformHostLabel()}/${username}`;
}

export function organizationSameAs(): string[] {
  return [
    process.env.NEXT_PUBLIC_SOCIAL_X_URL,
    process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL,
    process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL,
  ]
    .filter((url): url is string => Boolean(url?.trim()))
    .map((url) => url.trim());
}

export function entityFacts() {
  return {
    name: SITE_NAME,
    legalName: ENTITY_LEGAL_NAME,
    url: getSiteUrl(),
    category: ENTITY_CATEGORY,
    definition: ENTITY_DEFINITION,
    audience: ENTITY_AUDIENCE,
    payments: ENTITY_PAYMENTS,
    markets: ENTITY_MARKETS,
    pricing: ENTITY_PRICING,
    supportEmail: ENTITY_SUPPORT_EMAIL,
    creatorPageExample: entityCreatorPageExample(),
    sameAs: organizationSameAs(),
  };
}

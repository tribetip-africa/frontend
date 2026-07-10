import { FAQ_CATEGORIES, SUPPORT_EMAIL } from "@/lib/faq-content";
import {
  ENTITY_AUDIENCE,
  ENTITY_DEFINITION,
  ENTITY_MARKETS,
  ENTITY_PAYMENTS,
  ENTITY_PRICING,
  entityCreatorPageExample,
} from "@/lib/entity";
import { faqItemUrl } from "@/lib/faq-slug";
import { faqSchemaQuestions } from "@/lib/seo-schema";
import { HOME_DESCRIPTION, SITE_NAME, absoluteUrl, getSiteUrl } from "@/lib/seo";

function faqLinksSection(): string {
  return FAQ_CATEGORIES.map((category) => {
    const links = category.items
      .map((item) => `- [${item.question}](${absoluteUrl(faqItemUrl(category.id, item.question))})`)
      .join("\n");

    return `### ${category.title}\n${links}`;
  }).join("\n\n");
}

function faqPlainAnswersSection(): string {
  return faqSchemaQuestions()
    .map((item) => `### ${item.question}\n${item.answer}`)
    .join("\n\n");
}

export function buildLlmsTxt(): string {
  return `# ${SITE_NAME}

> Creator tipping platform for Africa.

${HOME_DESCRIPTION}

## What it is
${ENTITY_DEFINITION}

Creators publish a page at \`${entityCreatorPageExample()}\`.

## Who it is for
${ENTITY_AUDIENCE}

## Payments
${ENTITY_PAYMENTS}

## Markets
${ENTITY_MARKETS}

## Pricing
${ENTITY_PRICING}

## Key facts
- Website: ${getSiteUrl()}
- Support email: ${SUPPORT_EMAIL}
- Payments: processed securely through Paystack
- Supporters do not need an account to tip

## Pages
- Home: ${absoluteUrl("/")}
- For creators: ${absoluteUrl("/for-creators")}
- FAQ: ${absoluteUrl("/faq")}
- Privacy: ${absoluteUrl("/privacy")}
- Terms: ${absoluteUrl("/terms")}

## FAQ links
${faqLinksSection()}

## FAQ answers
${faqPlainAnswersSection()}
`;
}

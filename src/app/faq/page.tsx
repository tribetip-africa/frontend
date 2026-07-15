import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { CitationDefinition } from "@/components/seo/citation-definition";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { Button } from "@/components/ui/button";
import { FAQ_CATEGORIES, SUPPORT_EMAIL } from "@/lib/faq-content";
import { ENTITY_DEFINITION } from "@/lib/entity";
import { primaryLaunchCta } from "@/lib/launch-mode";
import { buildBreadcrumbJsonLd, buildFaqPageJsonLd, buildWebPageJsonLd } from "@/lib/seo-schema";
import { buildPageMetadata } from "@/lib/seo";

const FAQ_TITLE = "FAQ — Help & answers";
const FAQ_DESCRIPTION =
  "Answers to common questions about TribeTip: getting started, receiving tips, fees, payouts, account security, and support for African creators.";

export const metadata: Metadata = buildPageMetadata({
  title: FAQ_TITLE,
  description: FAQ_DESCRIPTION,
  path: "/faq",
});

export default function FaqPage() {
  const launchCta = primaryLaunchCta();

  return (
    <>
      <JsonLd
        data={[
          buildWebPageJsonLd({
            name: FAQ_TITLE,
            description: FAQ_DESCRIPTION,
            path: "/faq",
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
          buildFaqPageJsonLd(),
        ]}
      />
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="bg-white pt-12 pb-10 sm:pt-16 sm:pb-12">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="text-sm font-bold text-brand-600">Help center</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Frequently asked questions
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">
              Everything you need to know about tipping, payouts, and getting paid as a
              creator. Can&apos;t find an answer? We&apos;re an email away.
            </p>
          </div>
        </section>

        <CitationDefinition>{ENTITY_DEFINITION}</CitationDefinition>

        {/* Category quick-nav */}
        <section className="bg-white pb-2">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <nav aria-label="FAQ categories">
              <ul className="flex flex-wrap justify-center gap-2">
                {FAQ_CATEGORIES.map((category) => (
                  <li key={category.id}>
                    <a
                      href={`#${category.id}`}
                      className="inline-block rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
                    >
                      {category.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white pb-16 pt-8 sm:pb-24">
          <div className="mx-auto max-w-3xl space-y-14 px-4 sm:px-6">
            {FAQ_CATEGORIES.map((category) => (
              <div key={category.id} id={category.id} className="scroll-mt-24">
                <div className="mb-5">
                  <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
                    {category.title}
                  </h2>
                  <p className="mt-1 text-ink-soft">{category.description}</p>
                </div>
                <FaqAccordion categoryId={category.id} items={category.items} name={`faq-${category.id}`} />
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="section-alt py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Still have a question?
            </h2>
            <p className="mt-3 text-lg text-ink-soft">
              Our team is happy to help. Email us and we&apos;ll usually reply within one to
              two business days.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={`mailto:${SUPPORT_EMAIL}`}>
                <Button variant="primary" type="button" className="px-8 py-3.5 text-base">
                  Email support
                </Button>
              </a>
              {launchCta ? (
                <Link href={launchCta.href}>
                  <Button variant="secondary" type="button" className="px-8 py-3.5 text-base">
                    {launchCta.label}
                  </Button>
                </Link>
              ) : null}
            </div>
            <p className="mt-4 text-sm text-muted">{SUPPORT_EMAIL}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

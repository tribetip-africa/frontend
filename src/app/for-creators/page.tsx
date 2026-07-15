import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { CitationDefinition } from "@/components/seo/citation-definition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  FOR_CREATORS_DESCRIPTION,
  FOR_CREATORS_SECTIONS,
  FOR_CREATORS_TITLE,
} from "@/lib/for-creators-content";
import { ENTITY_DEFINITION } from "@/lib/entity";
import { primaryLaunchCta, showWaitlist } from "@/lib/launch-mode";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo-schema";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: FOR_CREATORS_TITLE,
  description: FOR_CREATORS_DESCRIPTION,
  path: "/for-creators",
});

export default function ForCreatorsPage() {
  const launchCta = primaryLaunchCta();
  const waitlistMode = showWaitlist();

  return (
    <>
      <JsonLd
        data={[
          buildWebPageJsonLd({
            name: FOR_CREATORS_TITLE,
            description: FOR_CREATORS_DESCRIPTION,
            path: "/for-creators",
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: FOR_CREATORS_TITLE, path: "/for-creators" },
          ]),
        ]}
      />
      <SiteHeader />
      <main>
        <section className="bg-white pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="text-sm font-bold text-brand-600">For creators</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Accept tips with one link — built for Africa
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">{FOR_CREATORS_DESCRIPTION}</p>
            {launchCta ? (
              <Link href={launchCta.href} className="mt-8 inline-block">
                <Button variant="primary" type="button" className="px-8 py-3.5 text-base">
                  {launchCta.label}
                </Button>
              </Link>
            ) : null}
          </div>
        </section>

        <CitationDefinition>{ENTITY_DEFINITION}</CitationDefinition>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-3xl space-y-12 px-4 sm:px-6">
            {FOR_CREATORS_SECTIONS.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
                  {section.title}
                </h2>
                {"paragraphs" in section
                  ? section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="mt-4 text-lg leading-relaxed text-ink-soft">
                        {paragraph}
                      </p>
                    ))
                  : null}
                {"bullets" in section ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-lg text-ink-soft">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="section-alt py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              {waitlistMode ? "Want early access?" : "Ready to launch your tip page?"}
            </h2>
            <p className="mt-3 text-lg text-ink-soft">
              {waitlistMode
                ? "Join the waitlist and we will invite you when creator sign-ups open for your market."
                : "Pick a username, add a short bio, and share your TribeTip link with your community."}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {launchCta ? (
                <Link href={launchCta.href}>
                  <Button variant="primary" type="button" className="px-8 py-3.5 text-base">
                    {launchCta.label}
                  </Button>
                </Link>
              ) : null}
              <Link href="/faq">
                <Button variant="secondary" type="button" className="px-8 py-3.5 text-base">
                  Read the FAQ
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

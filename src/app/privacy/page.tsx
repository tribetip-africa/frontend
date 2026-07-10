import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PRIVACY_LAST_UPDATED, PRIVACY_SECTIONS } from "@/lib/privacy-content";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo-schema";
import { buildPageMetadata } from "@/lib/seo";

const PRIVACY_TITLE = "Privacy Policy";
const PRIVACY_DESCRIPTION =
  "How TribeTip collects, uses, and protects your data — and the choices you have. We never email or sell your supporters.";

export const metadata: Metadata = buildPageMetadata({
  title: PRIVACY_TITLE,
  description: PRIVACY_DESCRIPTION,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={[
          buildWebPageJsonLd({
            name: PRIVACY_TITLE,
            description: PRIVACY_DESCRIPTION,
            path: "/privacy",
            dateModified: PRIVACY_LAST_UPDATED,
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Privacy Policy", path: "/privacy" },
          ]),
        ]}
      />
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="bg-white pt-12 pb-8 sm:pt-16 sm:pb-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-sm font-bold text-brand-600">Legal</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-ink-soft">
              We collect only what we need, never sell your data, and never email your
              supporters. Here&apos;s exactly how it works.
            </p>
            <p className="mt-3 text-sm text-muted">Last updated: {PRIVACY_LAST_UPDATED}</p>
          </div>
        </section>

        {/* Body: table of contents + sections */}
        <section className="bg-white pb-16 sm:pb-24">
          <div className="mx-auto max-w-5xl gap-12 px-4 sm:px-6 lg:grid lg:grid-cols-[16rem_1fr]">
            {/* Table of contents */}
            <aside className="mb-10 lg:mb-0">
              <div className="lg:sticky lg:top-24">
                <p className="text-sm font-bold text-ink">On this page</p>
                <nav aria-label="Table of contents" className="mt-3">
                  <ol className="space-y-2 text-sm">
                    {PRIVACY_SECTIONS.map((section, index) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="flex gap-2 text-ink-soft transition-colors hover:text-brand-600"
                        >
                          <span className="text-muted">{index + 1}.</span>
                          <span>{section.title}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </aside>

            {/* Sections */}
            <div className="min-w-0">
              <div className="surface-soft rounded-2xl p-6 text-ink-soft sm:p-8">
                <p>
                  This policy works alongside our{" "}
                  <Link href="/terms" className="font-semibold text-brand-600 hover:underline">
                    Terms of Service
                  </Link>
                  . If anything is unclear, our{" "}
                  <Link href="/faq" className="font-semibold text-brand-600 hover:underline">
                    FAQ
                  </Link>{" "}
                  may help, or you can reach our team directly.
                </p>
              </div>

              <div className="mt-10 space-y-10">
                {PRIVACY_SECTIONS.map((section, index) => (
                  <article key={section.id} id={section.id} className="scroll-mt-24">
                    <h2 className="font-display text-2xl font-extrabold text-ink">
                      <span className="text-brand-600">{index + 1}.</span> {section.title}
                    </h2>
                    <div className="mt-3 space-y-4 leading-relaxed text-ink-soft">
                      {section.blocks.map((block, blockIndex) =>
                        block.type === "paragraph" ? (
                          <p key={blockIndex}>{block.text}</p>
                        ) : (
                          <ul key={blockIndex} className="space-y-2">
                            {block.items.map((item) => (
                              <li key={item} className="flex items-start gap-3">
                                <span
                                  aria-hidden
                                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ),
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

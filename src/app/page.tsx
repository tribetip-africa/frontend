import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CreatorShowcase } from "@/components/landing/creator-showcase";
import { FeatureSection } from "@/components/landing/feature-section";
import { HeroUsernameCta } from "@/components/landing/hero-username-cta";
import { TipFlowPreview } from "@/components/landing/tip-flow-preview";
import { Button } from "@/components/ui/button";
import { enabledMarkets } from "@/lib/region-flags";

const benefits = [
  {
    title: "You own your supporters",
    body: "We never email your fans. Export your supporter list any time.",
    emoji: "🤝",
  },
  {
    title: "Paid locally, fast",
    body: "Tips settle to your balance. Withdraw to M-Pesa or your bank via Paystack.",
    emoji: "⚡",
  },
  {
    title: "Earn when you earn",
    body: "No monthly subscription. TribeTip only takes a cut when tips land.",
    emoji: "💚",
  },
  {
    title: "Mobile money native",
    body: "M-Pesa, MTN MoMo, cards, and bank transfers — built for African audiences.",
    emoji: "📱",
  },
];

export default function HomePage() {
  const markets = enabledMarkets();

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero — BMC-style: big headline + inline username CTA */}
        <section className="bg-white pt-12 pb-16 sm:pt-16 sm:pb-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Fund your creative work
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft sm:text-xl">
              Accept tips. Share one link. Get paid in your local currency — M-Pesa, card, or bank.
            </p>

            <div className="mx-auto mt-10 flex justify-center">
              <HeroUsernameCta />
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-md px-4 sm:mt-16">
            <TipFlowPreview variant="supporter" />
          </div>
        </section>

        {/* Alternating feature rows — BMC scroll storytelling */}
        <FeatureSection
          eyebrow="Tips"
          title="Give your audience an easy way to say thanks"
          description="TribeTip makes supporting fun and easy. In just a couple of taps, your fans can pay with mobile money or card and leave a message — no account needed."
          bullets={[
            "Preset tip amounts or custom amounts",
            "Works on slow mobile networks",
            "Supporters stay anonymous if they want",
          ]}
          visual={<TipFlowPreview variant="supporter" />}
        />

        <FeatureSection
          eyebrow="Payouts"
          title="Get paid to your bank or mobile wallet"
          description="Unlike platforms that hold your money for weeks, TribeTip routes earnings through Paystack so you can withdraw to M-Pesa, your bank, or mobile money."
          bullets={[
            "KES, NGN, GHS, ZAR and more",
            "Track every tip and settlement",
            "Manual withdraw when you're ready",
          ]}
          visual={<TipFlowPreview variant="payout" />}
          reversed
          alt
        />

        <CreatorShowcase />

        {/* Markets */}
        <section id="markets" className="section-alt py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold text-brand-600">Markets</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
                {markets.length === 1
                  ? `Live in ${markets[0]?.name}`
                  : "Built for creators across Africa"}
              </h2>
            </div>
            <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
              {markets.map((market) => (
                <li
                  key={market.code}
                  className="flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold shadow-sm"
                >
                  <span>{market.flag}</span>
                  {market.name}
                  <span className="text-muted">({market.currency})</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Benefits grid — BMC "designed for creators" */}
        <section id="creators" className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
                Designed for creators, not corporations
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-lg text-ink-soft">
                YouTubers, podcasters, artists, educators — anyone with an audience deserves a
                tip jar that works where they live.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <article
                  key={benefit.title}
                  className="surface-soft rounded-2xl p-6 sm:p-8"
                >
                  <span className="text-3xl" aria-hidden>
                    {benefit.emoji}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{benefit.title}</h3>
                  <p className="mt-2 text-ink-soft">{benefit.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-alt py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Ready to get your first tip?
            </h2>
            <p className="mt-3 text-lg text-ink-soft">
              Join creators building income from their communities — starting in Africa.
            </p>
            <Link href="/sign-up" className="mt-8 inline-block">
              <Button variant="primary" type="button" className="px-10 py-4 text-base">
                Start my page — it&apos;s free
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

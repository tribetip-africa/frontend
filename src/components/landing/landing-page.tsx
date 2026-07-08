"use client";

import Link from "next/link";
import { useRef } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AfricaFlowMap } from "@/components/landing/africa-flow-map";
import { CreatorShowcase } from "@/components/landing/creator-showcase";
import { FeatureSection } from "@/components/landing/feature-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingHero } from "@/components/landing/landing-hero";
import { TipFlowPreview } from "@/components/landing/tip-flow-preview";
import { useLandingScrollMotion } from "@/components/landing/use-landing-scroll-motion";
import { Button } from "@/components/ui/button";

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

export function LandingPage() {
  const mainRef = useRef<HTMLElement>(null);
  useLandingScrollMotion(mainRef);

  return (
    <>
      <SiteHeader />
      <main ref={mainRef}>
        <LandingHero />

        <HowItWorks />

        <FeatureSection
          motion
          eyebrow="For your fans"
          title="A one-tap way to say thanks"
          description="Each creator gets a public tip page. Fans open your link, pick an amount, pay with M-Pesa or card, and leave a message — no account or app download needed."
          bullets={[
            "Preset tip amounts or custom amounts",
            "Works on slow mobile networks",
            "Supporters stay anonymous if they want",
          ]}
          visual={<TipFlowPreview variant="supporter" />}
        />

        <FeatureSection
          motion
          eyebrow="For you"
          title="Tips land in your balance — withdraw on your schedule"
          description="Every tip shows up in your dashboard. When you're ready, withdraw to M-Pesa, your bank, or mobile money through Paystack. No waiting weeks for a platform to release your money."
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

        <div id="markets">
          <AfricaFlowMap />
        </div>

        <section id="creators" className="bg-white py-16 sm:py-24" data-landing="stagger-section">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center" data-landing="reveal">
              <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
                Designed for creators, not corporations
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-lg text-ink-soft">
                YouTubers, podcasters, artists, educators — anyone with an audience deserves a
                tip jar that works where they live.
              </p>
            </div>

            <div
              className="mt-12 grid gap-5 sm:grid-cols-2"
              data-landing="stagger-parent"
            >
              {benefits.map((benefit) => (
                <article
                  key={benefit.title}
                  data-landing="stagger-item"
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

        <section className="section-alt py-16 sm:py-20">
          <div
            className="mx-auto max-w-2xl px-4 text-center sm:px-6"
            data-landing="cta"
          >
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

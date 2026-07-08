"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { HeroUsernameCta } from "@/components/landing/hero-username-cta";
import { TipFlowPreview } from "@/components/landing/tip-flow-preview";
import { gsap, registerGsapPlugins, SplitText } from "@/lib/gsap/register";
import { prefersReducedMotion } from "@/lib/gsap/prefers-reduced-motion";

export function LandingHero() {
  const heroRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();

      const hero = heroRef.current;
      const headline = headlineRef.current;
      if (!hero || !headline) {
        return;
      }

      if (prefersReducedMotion()) {
        return;
      }

      const badge = hero.querySelector<HTMLElement>('[data-landing-hero="badge"]');
      const subhead = hero.querySelector<HTMLElement>('[data-landing-hero="subhead"]');
      const cta = hero.querySelector<HTMLElement>('[data-landing-hero="cta"]');
      const previewLabel = hero.querySelector<HTMLElement>('[data-landing-hero="preview-label"]');
      const preview = hero.querySelector<HTMLElement>('[data-landing-hero="preview"]');
      const previewFloat = hero.querySelector<HTMLElement>('[data-landing-hero="preview-float"]');

      const split = SplitText.create(headline, {
        type: "words",
        wordsClass: "landing-split-word",
      });

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .from(badge, { y: 18, autoAlpha: 0, duration: 0.55 })
        .from(
          split.words,
          {
            yPercent: 115,
            autoAlpha: 0,
            rotateX: -18,
            transformOrigin: "50% 100%",
            duration: 0.75,
            stagger: 0.045,
          },
          "-=0.25",
        )
        .from(subhead, { y: 22, autoAlpha: 0, duration: 0.65 }, "-=0.35")
        .from(cta, { y: 18, autoAlpha: 0, scale: 0.97, duration: 0.55 }, "-=0.3")
        .from(previewLabel, { autoAlpha: 0, duration: 0.45 }, "-=0.35")
        .from(
          preview,
          {
            x: 48,
            y: 28,
            autoAlpha: 0,
            rotate: 2.5,
            scale: 0.94,
            duration: 0.95,
          },
          "-=0.45",
        );

      gsap.to(preview, {
        y: -28,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1.1,
        },
      });

      gsap.to(previewFloat, {
        y: "+=9",
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.2,
      });

      return () => {
        split.revert();
      };
    },
    { scope: heroRef },
  );

  return (
    <section ref={heroRef} className="bg-white pt-12 pb-16 sm:pt-16 sm:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <p
              data-landing-hero="badge"
              className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-600"
            >
              Creator tipping platform · Built for Africa
            </p>
            <h1
              ref={headlineRef}
              data-landing-hero="headline"
              className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]"
            >
              A tip jar for creators — paid to M-Pesa or your bank
            </h1>
            <p
              data-landing-hero="subhead"
              className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl lg:mx-0"
            >
              TribeTip gives you a personal tip page. Share one link, let fans send tips with
              mobile money or card, and withdraw when you&apos;re ready. Free to start — we only
              earn when you do.
            </p>

            <div data-landing-hero="cta" className="mx-auto mt-10 max-w-xl lg:mx-0">
              <HeroUsernameCta />
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <p
              data-landing-hero="preview-label"
              className="mb-4 text-center text-sm font-semibold text-muted lg:text-left"
            >
              What your fans see when they visit your page
            </p>
            <div data-landing-hero="preview">
              <div data-landing-hero="preview-float">
                <TipFlowPreview variant="supporter" animated={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

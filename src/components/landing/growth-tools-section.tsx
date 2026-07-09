"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/gsap/register";
import { prefersReducedMotion } from "@/lib/gsap/prefers-reduced-motion";
import { WidgetMiniCard } from "@/widget/mini-card";
import { widgetCountryLabel, widgetPaymentHint } from "@/widget/embed";

const AUTO_ADVANCE_MS = 7000;

const TOOLS = [
  {
    id: "widget",
    label: "Website widget",
    eyebrow: "Website widget",
    title: "Embed tips on your site with one script tag",
    description:
      "Add a mini tip card to your blog, portfolio, or newsletter site. Visitors tip you without leaving the page — the same card style they see on your TribeTip profile.",
    bullets: [
      "Paste once, like Google Tag Manager or a chat widget",
      "Profile, amounts, and button text stay in sync automatically",
      "Turn the widget off anytime without deleting the snippet",
    ],
    visual: "widget" as const,
  },
  {
    id: "qr",
    label: "QR tip code",
    eyebrow: "QR tip code",
    title: "Get tipped offline, at events, and on print",
    description:
      "Download a branded QR code from your dashboard. Fans scan it with any phone camera and land on your tip page in seconds — perfect for posters, merch tables, and podcast show notes.",
    bullets: [
      "Opaque link keeps your username private on printed materials",
      "Rotate the code if an old link gets shared too widely",
      "Ready for WhatsApp statuses, flyers, and studio walls",
    ],
    visual: "qr" as const,
  },
  {
    id: "referrals",
    label: "Invite creators",
    eyebrow: "Invite creators",
    title: "Grow the tribe and earn when others succeed",
    description:
      "Share an expiring invite link or referral code with creators you know. When they sign up, finish payout setup, and receive their first tip, you both benefit.",
    bullets: [
      "Personal invite link and code from your dashboard",
      "Friends can paste your code during sign-up",
      "Turn referrals on or off whenever you want",
    ],
    visual: "referral" as const,
  },
] as const;

type Tool = (typeof TOOLS)[number];

function WidgetEmbedPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-sand p-4">
      <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-coral/80" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-200" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-400" aria-hidden />
          <span className="ml-2 text-xs font-medium text-muted">yourblog.com</span>
        </div>
        <div className="mt-4 space-y-2 opacity-40" aria-hidden>
          <div className="h-2.5 w-3/4 rounded bg-line" />
          <div className="h-2.5 w-full rounded bg-line" />
          <div className="h-2.5 w-5/6 rounded bg-line" />
        </div>
      </div>
      <div
        data-growth-accent="widget"
        className="absolute bottom-3 right-3 origin-bottom-right scale-[0.82] sm:scale-90"
      >
        <WidgetMiniCard
          username="ama_creates"
          displayName="Ama Creates"
          bio="Love the tutorials? Buy me a coffee."
          countryLabel={widgetCountryLabel("KE")}
          currency="KES"
          defaultTipAmountCents={50_000}
          ctaText="Support @ama_creates"
          paymentHint={widgetPaymentHint("KE")}
          position="bottom-right"
        />
      </div>
    </div>
  );
}

function QrTipPreview() {
  return (
    <div className="flex justify-center">
      <div className="surface-card relative w-full max-w-xs overflow-hidden rounded-3xl p-6 text-center">
        <div
          className="relative mx-auto grid h-44 w-44 grid-cols-8 gap-0.5 rounded-xl border border-line bg-white p-2"
          aria-hidden
        >
          {Array.from({ length: 64 }, (_, index) => (
            <span
              key={index}
              className={`rounded-sm ${index % 3 === 0 || index % 7 === 0 ? "bg-ink" : "bg-transparent"}`}
            />
          ))}
          <span
            data-growth-accent="qr-scan"
            className="pointer-events-none absolute inset-x-1 top-3 h-1 rounded-full bg-brand-500/70 shadow-[0_0_12px_rgba(53,111,79,0.45)]"
            style={{ opacity: 0 }}
            aria-hidden
          />
        </div>
        <p className="mt-4 text-base font-bold text-ink">Scan to tip Ama</p>
        <p className="mt-1 text-sm text-muted">Works with any phone camera</p>
      </div>
    </div>
  );
}

function ReferralInvitePreview() {
  return (
    <div className="surface-card mx-auto max-w-sm rounded-3xl p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Your invite</p>
      <p className="mt-2 text-base font-medium text-ink">Share a link or code with creators you trust</p>
      <div className="mt-5 space-y-3">
        <div
          data-growth-accent="referral-field"
          className="rounded-xl border border-line bg-sand px-3 py-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Sign-up link</p>
          <p className="mt-1 truncate font-mono text-sm text-ink">tribetip.africa/sign-up?ref=…</p>
        </div>
        <div
          data-growth-accent="referral-field"
          className="rounded-xl border border-line bg-sand px-3 py-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Referral code</p>
          <p className="mt-1 font-mono text-sm text-ink">@ama_creates</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">Expires in 30 days · rotate or turn off anytime</p>
    </div>
  );
}

function ToolVisual({ type }: { type: Tool["visual"] }) {
  switch (type) {
    case "widget":
      return <WidgetEmbedPreview />;
    case "qr":
      return <QrTipPreview />;
    case "referral":
      return <ReferralInvitePreview />;
  }
}

function GrowthToolSlide({ tool }: { tool: Tool }) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div data-growth-layer="text" className="order-2 lg:order-1">
        <p data-growth-layer="eyebrow" className="text-sm font-bold text-brand-600">
          {tool.eyebrow}
        </p>
        <h3
          data-growth-layer="title"
          className="mt-2 font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl"
        >
          {tool.title}
        </h3>
        <p data-growth-layer="description" className="mt-4 text-lg leading-relaxed text-ink-soft">
          {tool.description}
        </p>
        <ul className="mt-6 space-y-3">
          {tool.bullets.map((bullet) => (
            <li
              key={bullet}
              data-growth-layer="bullet"
              className="flex items-start gap-3 text-ink-soft"
            >
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
              {bullet}
            </li>
          ))}
        </ul>
      </div>

      <div data-growth-layer="visual" className="order-1 [perspective:1200px] lg:order-2">
        <div
          data-growth-layer="visual-inner"
          className="surface-card rounded-3xl p-4 sm:p-6 [transform-style:preserve-3d]"
        >
          <ToolVisual type={tool.visual} />
        </div>
      </div>
    </div>
  );
}

function getSlideLayers(slide: HTMLElement | null) {
  if (!slide) {
    return null;
  }

  return {
    eyebrow: slide.querySelector<HTMLElement>('[data-growth-layer="eyebrow"]'),
    title: slide.querySelector<HTMLElement>('[data-growth-layer="title"]'),
    description: slide.querySelector<HTMLElement>('[data-growth-layer="description"]'),
    bullets: gsap.utils.toArray<HTMLElement>('[data-growth-layer="bullet"]', slide),
    visual: slide.querySelector<HTMLElement>('[data-growth-layer="visual-inner"]'),
  };
}

function getSlideTextTargets(layers: NonNullable<ReturnType<typeof getSlideLayers>>) {
  return [layers.eyebrow, layers.title, layers.description, ...layers.bullets].filter(
    Boolean,
  ) as HTMLElement[];
}

function getSlideDirection(from: number, to: number, total: number) {
  if (from === to) {
    return 1;
  }

  const forward = (to - from + total) % total;
  const backward = (from - to + total) % total;
  return forward <= backward ? 1 : -1;
}

function resetSlideLayers(slide: HTMLElement | null) {
  const layers = getSlideLayers(slide);
  if (!layers) {
    return;
  }

  gsap.set(getSlideTextTargets(layers), { clearProps: "all" });
  if (layers.visual) {
    gsap.set(layers.visual, { clearProps: "all" });
  }
}

function hideSlide(slide: HTMLElement | null) {
  if (!slide) {
    return;
  }

  resetSlideLayers(slide);
  gsap.set(slide, {
    autoAlpha: 0,
    visibility: "hidden",
    pointerEvents: "none",
    zIndex: 1,
    clearProps: "transform",
  });
}

function showSlide(slide: HTMLElement | null, zIndex = 2) {
  if (!slide) {
    return;
  }

  gsap.set(slide, {
    autoAlpha: 1,
    visibility: "visible",
    pointerEvents: "auto",
    zIndex,
    clearProps: "transform",
  });
}

function playToolAccent(slide: HTMLElement | null, visual: Tool["visual"]) {
  if (!slide || prefersReducedMotion()) {
    return;
  }

  switch (visual) {
    case "widget": {
      const widget = slide.querySelector<HTMLElement>('[data-growth-accent="widget"]');
      if (!widget) {
        return;
      }

      gsap.fromTo(
        widget,
        { y: 16, rotate: 2.5, scale: 0.94 },
        { y: 0, rotate: 0, scale: 1, duration: 0.7, ease: "back.out(1.35)" },
      );
      break;
    }
    case "qr": {
      const scanLine = slide.querySelector<HTMLElement>('[data-growth-accent="qr-scan"]');
      if (!scanLine) {
        return;
      }

      gsap.fromTo(
        scanLine,
        { y: 0, opacity: 0 },
        {
          y: 152,
          opacity: 1,
          duration: 1.05,
          ease: "power1.inOut",
          repeat: 1,
          yoyo: true,
          onComplete: () => {
            gsap.set(scanLine, { opacity: 0, y: 0 });
          },
        },
      );
      break;
    }
    case "referral": {
      const fields = gsap.utils.toArray<HTMLElement>(
        '[data-growth-accent="referral-field"]',
        slide,
      );
      if (fields.length === 0) {
        return;
      }

      gsap.fromTo(
        fields,
        { y: 10, scale: 0.97, autoAlpha: 0.45 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.55, stagger: 0.1, ease: "power2.out" },
      );
      break;
    }
  }
}

export function GrowthToolsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const previousIndex = useRef(0);
  const directionRef = useRef(1);
  const isFirstRender = useRef(true);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);

  const tool = TOOLS[activeIndex];

  const goToSlide = useCallback(
    (index: number, direction?: number) => {
      const normalized = (index + TOOLS.length) % TOOLS.length;
      if (direction !== undefined) {
        directionRef.current = direction;
      } else if (normalized !== activeIndex) {
        directionRef.current = getSlideDirection(activeIndex, normalized, TOOLS.length);
      }
      setActiveIndex(normalized);
    },
    [activeIndex],
  );

  const goNext = useCallback(() => {
    goToSlide(activeIndex + 1, 1);
  }, [activeIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide(activeIndex - 1, -1);
  }, [activeIndex, goToSlide]);

  const syncVisibleSlide = useCallback((index: number) => {
    const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
    slides.forEach((slide, slideIndex) => {
      if (slideIndex === index) {
        showSlide(slide);
      } else {
        hideSlide(slide);
      }
    });
  }, []);

  useGSAP(
    () => {
      const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
      if (slides.length === 0) {
        return;
      }

      transitionRef.current?.kill();

      if (prefersReducedMotion()) {
        syncVisibleSlide(activeIndex);
        previousIndex.current = activeIndex;
        return;
      }

      const currentSlide = slides[activeIndex];
      const previousSlide = slides[previousIndex.current];
      const direction = directionRef.current;

      const revealText = (layers: NonNullable<ReturnType<typeof getSlideLayers>>) => {
        return gsap.fromTo(
          getSlideTextTargets(layers),
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.58,
            stagger: 0.07,
            ease: "power3.out",
          },
        );
      };

      if (isFirstRender.current) {
        isFirstRender.current = false;
        slides.forEach((slide, index) => {
          if (index === activeIndex) {
            showSlide(slide);
          } else {
            hideSlide(slide);
          }
        });

        const layers = getSlideLayers(currentSlide);
        if (!layers?.visual) {
          previousIndex.current = activeIndex;
          return;
        }

        gsap.set(getSlideTextTargets(layers), { y: 24, autoAlpha: 0 });
        gsap.set(layers.visual, { rotateY: -18, x: 36, autoAlpha: 0, scale: 0.95 });

        const intro = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => playToolAccent(currentSlide, TOOLS[activeIndex].visual),
        });

        intro
          .to(layers.visual, { rotateY: 0, x: 0, autoAlpha: 1, scale: 1, duration: 0.72 }, 0)
          .add(revealText(layers), 0.1);

        transitionRef.current = intro;
        previousIndex.current = activeIndex;
        return;
      }

      if (!currentSlide || activeIndex === previousIndex.current) {
        syncVisibleSlide(activeIndex);
        return;
      }

      const oldLayers = getSlideLayers(previousSlide);
      const newLayers = getSlideLayers(currentSlide);
      if (!oldLayers?.visual || !newLayers?.visual) {
        syncVisibleSlide(activeIndex);
        previousIndex.current = activeIndex;
        return;
      }

      gsap.killTweensOf(slides);
      slides.forEach((slide, index) => {
        if (index !== activeIndex && index !== previousIndex.current) {
          hideSlide(slide);
        }
      });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          hideSlide(previousSlide);
          showSlide(currentSlide);
          playToolAccent(currentSlide, TOOLS[activeIndex].visual);
        },
      });

      timeline
        .to(
          previousSlide,
          { autoAlpha: 0, duration: 0.28, ease: "power2.in" },
          0,
        )
        .to(
          oldLayers.visual,
          { rotateY: direction * 42, scale: 0.94, duration: 0.28, ease: "power2.in" },
          0,
        )
        .to(
          getSlideTextTargets(oldLayers),
          { x: direction * -20, autoAlpha: 0, duration: 0.24, stagger: 0.03, ease: "power2.in" },
          0,
        )
        .add(() => {
          hideSlide(previousSlide);
          showSlide(currentSlide, 2);
          resetSlideLayers(currentSlide);
          gsap.set(newLayers.visual, { rotateY: direction * -48, scale: 0.94, autoAlpha: 0 });
          gsap.set(getSlideTextTargets(newLayers), { y: 24, autoAlpha: 0, x: 0 });
        })
        .to(
          newLayers.visual,
          { rotateY: 0, scale: 1, autoAlpha: 1, duration: 0.58, ease: "power3.out" },
        )
        .add(revealText(newLayers), "-=0.34");

      transitionRef.current = timeline;
      previousIndex.current = activeIndex;
    },
    { dependencies: [activeIndex, syncVisibleSlide], scope: sectionRef },
  );

  useGSAP(
    () => {
      registerGsapPlugins();

      if (prefersReducedMotion()) {
        return;
      }

      const section = sectionRef.current;
      if (!section) {
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 88%",
        onEnter: () => syncVisibleSlide(activeIndex),
        onEnterBack: () => syncVisibleSlide(activeIndex),
      });

      return () => {
        trigger.kill();
      };
    },
    { dependencies: [activeIndex, syncVisibleSlide], scope: sectionRef },
  );

  useEffect(() => {
    if (paused || prefersReducedMotion()) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % TOOLS.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [paused]);

  useGSAP(
    () => {
      if (!progressRef.current || prefersReducedMotion() || paused) {
        return;
      }

      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: AUTO_ADVANCE_MS / 1000, ease: "none" },
      );
    },
    { dependencies: [activeIndex, paused], scope: sectionRef },
  );

  return (
    <section
      id="growth-tools"
      ref={sectionRef}
      className="landing-section-warm border-y border-line py-16 sm:py-24"
      data-landing="stagger-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!sectionRef.current?.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center" data-landing="reveal-once">
          <p className="text-sm font-bold text-brand-600">Grow beyond your link</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Widget, QR, and referrals — built into your dashboard
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Your tip page is the foundation. TribeTip also gives you tools to reach fans on your
            website, in person, and through other creators.
          </p>
        </div>

        <div
          className="mt-10 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Growth tools"
        >
          {TOOLS.map((item, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`growth-tool-panel-${item.id}`}
                id={`growth-tool-tab-${item.id}`}
                onClick={() => goToSlide(index)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  selected
                    ? "bg-brand-600 text-white shadow-sm"
                    : "border border-line bg-surface text-ink-soft hover:border-brand-200 hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          className="relative mt-10 min-h-[34rem] overflow-hidden sm:min-h-[30rem] lg:min-h-[26rem]"
          role="tabpanel"
          id={`growth-tool-panel-${tool.id}`}
          aria-labelledby={`growth-tool-tab-${tool.id}`}
          aria-live="polite"
        >
          {TOOLS.map((item, index) => (
            <div
              key={item.id}
              ref={(element) => {
                slideRefs.current[index] = element;
              }}
              className="absolute inset-0"
              aria-hidden={index !== activeIndex}
            >
              <GrowthToolSlide tool={item} />
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-brand-200 hover:bg-brand-50"
            aria-label="Previous growth tool"
          >
            <span aria-hidden>←</span>
          </button>

          <div className="flex items-center gap-2">
            {TOOLS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToSlide(index)}
                className={`relative h-2.5 overflow-hidden rounded-full transition-all duration-300 ${
                  index === activeIndex ? "w-10 bg-brand-100" : "w-2.5 bg-line hover:bg-brand-200"
                }`}
                aria-label={`Show ${item.label}`}
              >
                {index === activeIndex && (
                  <span
                    ref={progressRef}
                    className="absolute inset-0 origin-left rounded-full bg-brand-600"
                    style={{ transform: "scaleX(0)" }}
                  />
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-brand-200 hover:bg-brand-50"
            aria-label="Next growth tool"
          >
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

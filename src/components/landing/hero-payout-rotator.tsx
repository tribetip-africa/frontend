"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { HERO_PAYOUT_METHODS } from "@/lib/hero-payout-destinations";
import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/gsap/register";
import { prefersReducedMotion } from "@/lib/gsap/prefers-reduced-motion";

type HeroPayoutRotatorProps = {
  scrollRootRef?: React.RefObject<HTMLElement | null>;
};

const PAYOUT_ROTATOR_FADE_DURATION = 0.12;
const PAYOUT_ROTATOR_HOLD_DURATION = 2.6;

export function HeroPayoutRotator({ scrollRootRef }: HeroPayoutRotatorProps) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();

      const root = rootRef.current;
      if (!root) return;

      const items = Array.from(
        root.querySelectorAll<HTMLElement>("[data-payout-word]"),
      );
      if (items.length <= 1) return;

      let activeIndex = 0;

      const markActive = (index: number) => {
        items.forEach((item, itemIndex) => {
          item.classList.toggle("is-active", itemIndex === index);
        });
      };

      const setActive = (index: number, { animate = true } = {}) => {
        const nextIndex = ((index % items.length) + items.length) % items.length;
        if (nextIndex === activeIndex && animate) return;

        const previousIndex = activeIndex;
        activeIndex = nextIndex;

        if (!animate) {
          items.forEach((item, itemIndex) => {
            gsap.set(item, { autoAlpha: itemIndex === activeIndex ? 1 : 0 });
          });
          markActive(activeIndex);
          return;
        }

        const timeline = gsap.timeline({ defaults: { ease: "power2.inOut", overwrite: true } });

        timeline.call(() => markActive(activeIndex));

        if (items[previousIndex]) {
          timeline.to(items[previousIndex], { autoAlpha: 0, duration: PAYOUT_ROTATOR_FADE_DURATION });
        }

        timeline.fromTo(
          items[activeIndex],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: PAYOUT_ROTATOR_FADE_DURATION },
          "<",
        );
      };

      if (prefersReducedMotion()) {
        gsap.set(items[0], { autoAlpha: 1 });
        markActive(0);
        return;
      }

      setActive(0, { animate: false });

      const autoTimeline = gsap.timeline({ repeat: -1 });
      autoTimeline.to({}, { duration: PAYOUT_ROTATOR_HOLD_DURATION });
      autoTimeline.call(() => setActive(activeIndex + 1));

      const scrollTrigger =
        scrollRootRef?.current &&
        ScrollTrigger.create({
          trigger: scrollRootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.35,
          onUpdate: (self) => {
            autoTimeline.pause();
            const nextIndex = Math.min(
              items.length - 1,
              Math.floor(self.progress * items.length),
            );
            if (nextIndex !== activeIndex) {
              setActive(nextIndex, { animate: false });
            }
          },
          onLeave: () => autoTimeline.play(),
          onEnterBack: (self) => {
            if (self.progress > 0.02) {
              autoTimeline.pause();
              return;
            }
            autoTimeline.play();
          },
        });

      return () => {
        autoTimeline.kill();
        scrollTrigger?.kill();
      };
    },
    { scope: rootRef, dependencies: [scrollRootRef] },
  );

  return (
    <span
      ref={rootRef}
      data-landing-hero="headline-rotator"
      className="hero-payout-rotator text-brand-600"
      aria-live="polite"
    >
      {HERO_PAYOUT_METHODS.map((method, index) => (
        <span
          key={method.id}
          data-payout-word
          className={`hero-payout-rotator-item${index === 0 ? " is-active" : ""}`}
          aria-hidden={index !== 0}
        >
          {method.label}
        </span>
      ))}
      <span className="sr-only">
        {HERO_PAYOUT_METHODS.map((method) => method.label).join(", ")}
      </span>
    </span>
  );
}

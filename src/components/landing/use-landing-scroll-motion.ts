"use client";

import type { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/gsap/register";
import { prefersReducedMotion } from "@/lib/gsap/prefers-reduced-motion";

/** Play on enter, reverse on leave — works scrolling down and back up. */
const REVERSIBLE_TOGGLE = "play reverse play reverse";
const REVEAL_ONCE_TOGGLE = "play none none none";

type ScrollRevealOptions = {
  trigger: Element;
  start?: string;
  end?: string;
};

function scrollReveal(
  targets: gsap.TweenTarget,
  vars: gsap.TweenVars,
  { trigger, start = "top 85%", end = "bottom 18%" }: ScrollRevealOptions,
  toggleActions: string = REVERSIBLE_TOGGLE,
) {
  return gsap.from(targets, {
    ...vars,
    immediateRender: false,
    scrollTrigger: {
      trigger,
      start,
      end,
      toggleActions,
    },
  });
}

function getStaggerTrigger(parent: HTMLElement): Element {
  return parent.closest('[data-landing="stagger-section"]') ?? parent;
}

function getStaggerItems(parent: HTMLElement): HTMLElement[] {
  return gsap.utils.toArray<HTMLElement>(
    ':scope > [data-landing="stagger-item"]',
    parent,
  );
}

export function useLandingScrollMotion(scopeRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      registerGsapPlugins();

      const scope = scopeRef.current;
      if (!scope || prefersReducedMotion()) {
        return;
      }

      const reveals = gsap.utils.toArray<HTMLElement>(
        '[data-landing="reveal"], [data-landing="reveal-once"]',
        scope,
      );
      reveals.forEach((element) => {
        const section = element.closest('[data-landing="stagger-section"]');
        const once = element.getAttribute("data-landing") === "reveal-once";
        scrollReveal(
          element,
          { y: 44, autoAlpha: 0, duration: 0.85, ease: "power3.out" },
          {
            trigger: section ?? element,
            start: section ? "top 82%" : "top 85%",
          },
          once ? REVEAL_ONCE_TOGGLE : REVERSIBLE_TOGGLE,
        );
      });

      const staggerParents = gsap.utils.toArray<HTMLElement>(
        '[data-landing="stagger-parent"]',
        scope,
      );
      staggerParents.forEach((parent) => {
        const items = getStaggerItems(parent);
        if (items.length === 0) {
          return;
        }

        scrollReveal(
          items,
          {
            y: 36,
            autoAlpha: 0,
            duration: 0.7,
            stagger: 0.11,
            ease: "power3.out",
          },
          {
            trigger: getStaggerTrigger(parent),
            start: "top 78%",
            end: "bottom 12%",
          },
        );
      });

      const features = gsap.utils.toArray<HTMLElement>('[data-landing="feature"]', scope);
      features.forEach((section) => {
        const reversed = section.dataset.landingDirection === "reversed";
        const text = section.querySelector<HTMLElement>('[data-landing="feature-text"]');
        const visual = section.querySelector<HTMLElement>('[data-landing="feature-visual"]');

        if (text) {
          scrollReveal(
            text,
            {
              x: reversed ? 56 : -56,
              autoAlpha: 0,
              duration: 0.95,
              ease: "power3.out",
            },
            { trigger: section, start: "top 78%", end: "bottom 18%" },
          );
        }

        if (visual) {
          scrollReveal(
            visual,
            {
              x: reversed ? -56 : 56,
              autoAlpha: 0,
              scale: 0.95,
              duration: 0.95,
              ease: "power3.out",
            },
            { trigger: section, start: "top 78%", end: "bottom 18%" },
          );

          gsap.to(visual, {
            y: -26,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.15,
            },
          });
        }
      });

      const mapSection = scope.querySelector<HTMLElement>('[data-landing="map"]');
      if (mapSection) {
        const mapBlock = mapSection.closest("section") ?? mapSection;
        scrollReveal(
          mapSection,
          { scale: 0.96, autoAlpha: 0, duration: 1, ease: "power2.out" },
          { trigger: mapBlock, start: "top 78%", end: "bottom 18%" },
        );
      }

      const cta = scope.querySelector<HTMLElement>('[data-landing="cta"]');
      if (cta) {
        scrollReveal(
          cta,
          { scale: 0.9, autoAlpha: 0, duration: 0.85, ease: "back.out(1.35)" },
          { trigger: cta, start: "top 86%", end: "bottom 22%" },
        );
      }

      const refresh = () => ScrollTrigger.refresh();
      const refreshTimer = window.setTimeout(refresh, 120);
      window.addEventListener("load", refresh);

      return () => {
        window.clearTimeout(refreshTimer);
        window.removeEventListener("load", refresh);
      };
    },
    { scope: scopeRef },
  );
}

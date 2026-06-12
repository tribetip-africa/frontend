import type { ReactNode } from "react";

type FeatureSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets?: string[];
  visual: ReactNode;
  reversed?: boolean;
  alt?: boolean;
};

export function FeatureSection({
  eyebrow,
  title,
  description,
  bullets,
  visual,
  reversed = false,
  alt = false,
}: FeatureSectionProps) {
  return (
    <section className={alt ? "section-alt py-16 sm:py-24" : "bg-white py-16 sm:py-24"}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div className={reversed ? "lg:order-2" : ""}>
          <p className="text-sm font-bold text-brand-600">{eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{description}</p>
          {bullets && bullets.length > 0 && (
            <ul className="mt-6 space-y-3">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-ink-soft">
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent"
                    aria-hidden
                  />
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={reversed ? "lg:order-1" : ""}>{visual}</div>
      </div>
    </section>
  );
}

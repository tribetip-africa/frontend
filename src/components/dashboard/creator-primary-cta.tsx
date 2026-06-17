import Link from "next/link";
import type { CreatorPrimaryCta } from "@/lib/creator-onboarding-progress";
import { Button } from "@/components/ui/button";

type CreatorPrimaryCtaCardProps = {
  cta: CreatorPrimaryCta;
};

export function CreatorPrimaryCtaCard({ cta }: CreatorPrimaryCtaCardProps) {
  return (
    <section className="rounded-2xl border border-accent/30 bg-accent-soft/60 px-5 py-4 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Next step</p>
          <h2 className="mt-1 font-semibold text-brand-900">{cta.label}</h2>
          <p className="mt-1 text-sm text-brand-700">{cta.description}</p>
        </div>
        <Link href={cta.href}>
          <Button type="button" variant="primary">
            {cta.label}
          </Button>
        </Link>
      </div>
    </section>
  );
}

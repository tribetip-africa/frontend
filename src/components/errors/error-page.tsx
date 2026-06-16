import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ErrorPageContent } from "@/lib/error-pages";

type ErrorPageProps = ErrorPageContent & {
  onPrimaryAction?: () => void;
};

const linkPrimaryClass =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold bg-accent text-ink shadow-sm transition-all duration-150 hover:bg-accent-hover hover:shadow-md";

const linkSecondaryClass =
  "inline-flex items-center justify-center rounded-full border-2 border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-all duration-150 hover:border-ink/20 hover:bg-sand";

export function ErrorPage({
  code,
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  onPrimaryAction,
}: ErrorPageProps) {
  const primaryIsAction = primaryHref === "#retry" || primaryHref === "#reload";

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-cream px-4 py-16">
      <div className="surface-card w-full max-w-md rounded-2xl p-8 text-center sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">{code}</p>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">{description}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {primaryIsAction && onPrimaryAction ? (
            <Button type="button" onClick={onPrimaryAction}>
              {primaryLabel}
            </Button>
          ) : (
            <Link href={primaryHref} className={linkPrimaryClass}>
              {primaryLabel}
            </Link>
          )}
          <Link href={secondaryHref} className={linkSecondaryClass}>
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}

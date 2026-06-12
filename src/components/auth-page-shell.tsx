import Link from "next/link";
import type { ReactNode } from "react";
import { TipFlowPreview } from "@/components/landing/tip-flow-preview";
import { Logo } from "@/components/brand/logo";

type AuthPageShellProps = {
  mode: "sign-in" | "sign-up";
  title: string;
  description: string;
  note?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
};

const perks = [
  "Free to start — no monthly fee",
  "One link for Instagram, YouTube, TikTok & more",
  "M-Pesa, card, and bank payouts",
  "Your supporters, your relationship",
];

export function AuthPageShell({
  mode,
  title,
  description,
  note,
  banner,
  children,
}: AuthPageShellProps) {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col lg:flex-row">
      {/* Left — warm cream panel with preview (BMC-style split) */}
      <aside className="section-alt hidden lg:flex lg:w-[44%] lg:flex-col lg:justify-center xl:w-1/2">
        <div className="px-10 py-12 xl:px-16 xl:py-16">
          <Logo href="/" size="md" />
          <h2 className="mt-8 font-display text-3xl font-extrabold leading-tight text-ink xl:text-4xl">
            {mode === "sign-up"
              ? "Your audience is ready to support you"
              : "Welcome back, creator"}
          </h2>
          <p className="mt-3 max-w-sm text-ink-soft">
            {mode === "sign-up"
              ? "Claim your username and share your link today."
              : "Pick up where you left off — tips, payouts, and your public page."}
          </p>

          <ul className="mt-8 space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-sm text-ink-soft">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-ink">
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </ul>

          <div className="mt-10 scale-90 xl:scale-100">
            <TipFlowPreview variant="supporter" />
          </div>
        </div>
      </aside>

      {/* Right — form */}
      <section className="flex w-full flex-1 flex-col bg-white px-4 pb-10 pt-6 sm:px-8 sm:pt-8 lg:w-[56%] lg:px-12 lg:pt-10 xl:w-1/2 xl:px-16">
        <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg">
          <Link
            href="/"
            className="inline-flex text-sm text-muted transition hover:text-ink"
          >
            ← Back to home
          </Link>

          <div className="mt-4 lg:hidden">
            <Logo href="/" size="sm" />
          </div>

          <div className="mt-4">
            <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
            <p className="mt-1.5 text-ink-soft">{description}</p>
            {note}
          </div>

          {banner}

          <div className="surface-panel mt-5 rounded-2xl p-5 sm:p-6">{children}</div>
        </div>
      </section>
    </main>
  );
}

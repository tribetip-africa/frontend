import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WaitlistForm } from "@/components/waitlist-form";
import { showWaitlist } from "@/lib/launch-mode";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Join the waitlist",
  description:
    "Join the TribeTip waitlist for early access. One link for African creators to accept tips with mobile money, cards, and bank transfers.",
  path: "/waitlist",
});

export default function WaitlistPage() {
  if (!showWaitlist()) {
    redirect("/");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-landing px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-landing gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold text-brand-600">Early access</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Join the TribeTip waitlist
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              We&apos;re opening creator sign-ups in waves. Leave your email and we&apos;ll invite you
              when your market goes live — starting with Kenya, then more African markets.
            </p>
            <ul className="mt-6 space-y-3 text-ink-soft">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                One link for tips with M-Pesa, cards, and bank payouts
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                Free to start — we only earn when you receive tips
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                Early waitlist members get first access when we launch
              </li>
            </ul>
            <p className="mt-6 text-sm text-muted">
              We&apos;ll only use your email to notify you about launch access.
            </p>
          </div>

          <div className="surface-panel rounded-3xl p-6 sm:p-8">
            <h2 className="font-display text-xl font-extrabold text-ink">Get notified at launch</h2>
            <p className="mt-2 text-sm text-ink-soft">No spam — just one email when you can create your page.</p>
            <div className="mt-6">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

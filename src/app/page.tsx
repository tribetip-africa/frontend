import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { AFRICAN_MARKETS } from "@/lib/constants";
import { getPlatformHostLabel } from "@/lib/platform";

const steps = [
  {
    title: "Create your page",
    body: `Pick your country, set a username, and share one link — ${getPlatformHostLabel()}/yourname.`,
  },
  {
    title: "Fans tip in seconds",
    body: "Supporters pay with card or mobile money. No account needed, just like buying you a coffee.",
  },
  {
    title: "Get paid locally",
    body: "Tips land in your balance. Withdraw to your Nigerian, Ghanaian, Kenyan, or South African bank.",
  },
];

const features = [
  {
    title: "Local currencies",
    body: "NGN, GHS, KES, ZAR, XOF — supporters see amounts they understand.",
  },
  {
    title: "Mobile-first",
    body: "Most of your audience is on phone. Checkout is fast on slow networks.",
  },
  {
    title: "Your supporters, your list",
    body: "You own your fan relationships. We never email them without you.",
  },
  {
    title: "Simple fees",
    body: "We only earn when you do. No monthly subscription to get started.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="pattern-dots relative overflow-hidden border-b border-brand-100">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-brand-200/60 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-800">
                <span>🌍</span> Built for African creators
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-brand-900 sm:text-5xl lg:text-6xl">
                Fund your creative work —{" "}
                <span className="text-brand-600">from Lagos to Nairobi</span>
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-brand-800/90 sm:text-xl">
                TribeTip is the simple way to accept tips, memberships, and support from your
                audience. One link, local payments, payouts that reach your bank.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/sign-up">
                  <Button type="button" className="px-7 py-3 text-base">
                    Start your page — free
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="secondary" type="button" className="px-7 py-3 text-base">
                    See how it works
                  </Button>
                </a>
              </div>
              <p className="mt-4 text-sm text-brand-700/80">
                Setup in under 5 minutes · No monthly fee · Supporters don&apos;t need an account
              </p>
            </div>

            <div className="mt-14 lg:absolute lg:right-6 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2 lg:w-[380px]">
              <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-900/5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Example tip page
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
                    ☕
                  </div>
                  <div>
                    <p className="font-semibold text-brand-900">@ama_creates</p>
                    <p className="text-sm text-brand-700">Writer · Lagos, Nigeria</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-brand-800/90">
                  If my essays helped you today, buy me a coffee — it keeps the newsletter free.
                </p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {["₦500", "₦1,000", "Custom"].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="rounded-xl border border-brand-200 bg-brand-50 py-2.5 text-sm font-semibold text-brand-800"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white"
                >
                  Send a tip
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-b border-brand-100 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold text-brand-900 sm:text-4xl">
              Easier than you think
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-brand-700">
              Inspired by the simplicity of Buy Me a Coffee — redesigned for African payments and
              payouts.
            </p>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="relative rounded-2xl border border-brand-100 bg-cream p-6"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-brand-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-700">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="markets" className="border-b border-brand-100 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-brand-900 sm:text-4xl">
              Launch markets across Africa
            </h2>
            <p className="mt-3 max-w-2xl text-brand-700">
              We&apos;re starting where mobile money and creator economies are booming — with more
              countries coming soon.
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {AFRICAN_MARKETS.map((market) => (
                <li
                  key={market.code}
                  className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-4 shadow-sm"
                >
                  <span className="text-2xl">{market.flag}</span>
                  <div>
                    <p className="font-semibold text-brand-900">{market.name}</p>
                    <p className="text-sm text-brand-600">{market.currency}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="creators" className="bg-brand-900 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Designed for creators, not corporations
                </h2>
                <p className="mt-4 text-brand-100/90 leading-relaxed">
                  YouTubers, podcasters, artists, developers, educators — anyone with an audience
                  deserves a tip jar that works where they live. TribeTip keeps checkout friction
                  low and puts you in control of your supporter relationships.
                </p>
                <Link href="/sign-up" className="mt-8 inline-block">
                  <Button
                    type="button"
                    className="bg-accent text-brand-900 hover:bg-accent/90 px-7 py-3"
                  >
                    Claim your username
                  </Button>
                </Link>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <li
                    key={feature.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                  >
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-brand-100/80">{feature.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold text-brand-900">Ready to get your first tip?</h2>
            <p className="mt-3 text-brand-700">
              Join creators building sustainable income from their communities — starting in Africa.
            </p>
            <Link href="/sign-up" className="mt-8 inline-block">
              <Button type="button" className="px-8 py-3 text-base">
                Create your TribeTip page
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

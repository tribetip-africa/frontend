const STEPS = [
  {
    step: "1",
    title: "Create your free tip page",
    body: "Pick your link — tribetip.africa/yourname — add a photo and short bio. Takes about a minute.",
    emoji: "🔗",
  },
  {
    step: "2",
    title: "Share it anywhere",
    body: "Drop the link in your Instagram bio, YouTube description, podcast show notes, or WhatsApp status.",
    emoji: "📣",
  },
  {
    step: "3",
    title: "Fans tip you, you cash out",
    body: "Supporters pay with M-Pesa, MTN MoMo, card, or bank transfer. Withdraw to your wallet or bank when you're ready.",
    emoji: "💸",
  },
] as const;

const AUDIENCES = [
  "YouTubers",
  "Podcasters",
  "Artists",
  "Educators",
  "Writers",
  "Developers",
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-alt py-16 sm:py-24" data-landing="stagger-section">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center" data-landing="reveal">
          <p className="text-sm font-bold text-brand-600">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Three steps from sign-up to your first tip
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-ink-soft">
            TribeTip is a personal tip page for creators — like a digital tip jar your audience
            can use from any phone.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 lg:grid-cols-3" data-landing="stagger-parent">
          {STEPS.map((item) => (
            <li
              key={item.step}
              data-landing="stagger-item"
              className="surface-card relative rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white"
                  aria-hidden
                >
                  {item.step}
                </span>
                <span className="text-3xl" aria-hidden>
                  {item.emoji}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-ink">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{item.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 text-center" data-landing="reveal">
          <p className="text-sm font-semibold text-muted">Made for</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2" data-landing="stagger-parent">
            {AUDIENCES.map((label) => (
              <li
                key={label}
                data-landing="stagger-item"
                className="rounded-full border border-line bg-white px-4 py-1.5 text-sm font-semibold text-ink-soft"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

"use client";

const TIP_AMOUNTS = ["KSh 500", "KSh 1,000", "Custom"];

export function HeroPhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] animate-float lg:mx-0">
      <div
        className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-accent/30 via-coral/10 to-brand-600/20 blur-2xl animate-pulse-glow"
        aria-hidden
      />

      <div className="relative rounded-[2.5rem] border border-brand-900/10 bg-ink p-3 shadow-2xl shadow-brand-900/25">
        <div className="overflow-hidden rounded-[2rem] bg-cream">
          <div className="flex items-center justify-between border-b border-brand-100 bg-white px-4 py-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-coral/80" />
              <span className="h-2 w-2 rounded-full bg-accent/80" />
              <span className="h-2 w-2 rounded-full bg-brand-400/80" />
            </div>
            <p className="text-[10px] font-medium text-brand-600">tribetip.africa/ama</p>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-deep text-2xl shadow-md">
                ✦
              </div>
              <div>
                <p className="font-display text-base font-bold text-brand-900">@ama_creates</p>
                <p className="text-xs text-brand-600">Writer · Nairobi</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-brand-800">
              If my essays helped you today, send a tip — it keeps the newsletter free for everyone.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {TIP_AMOUNTS.map((amount, index) => (
                <div
                  key={amount}
                  className={`rounded-xl border py-2.5 text-center text-xs font-semibold ${
                    index === 1
                      ? "border-brand-600 bg-brand-600 text-white shadow-md"
                      : "border-brand-200 bg-white text-brand-800"
                  }`}
                >
                  {amount}
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-full bg-gradient-to-r from-accent to-accent-deep py-3 text-center text-sm font-bold text-ink shadow-lg shadow-accent/25">
              Send tip via M-Pesa
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-brand-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
              Secured by Paystack
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -left-4 top-16 hidden rounded-2xl border border-white/20 bg-ink px-3 py-2 shadow-xl sm:block">
        <p className="text-[10px] font-medium uppercase tracking-wider text-accent">Just now</p>
        <p className="font-display text-sm font-bold text-white">+ KSh 1,000</p>
      </div>

      <div className="absolute -right-2 bottom-20 hidden rounded-2xl border border-brand-200 bg-white px-3 py-2 shadow-lg sm:block">
        <p className="text-[10px] text-brand-600">Withdrawn to KCB</p>
        <p className="font-display text-sm font-bold text-brand-900">KSh 24,500</p>
      </div>
    </div>
  );
}

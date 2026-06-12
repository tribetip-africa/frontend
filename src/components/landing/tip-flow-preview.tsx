type TipFlowPreviewProps = {
  variant?: "supporter" | "payout";
};

export function TipFlowPreview({ variant = "supporter" }: TipFlowPreviewProps) {
  if (variant === "payout") {
    return (
      <div className="surface-card mx-auto max-w-sm rounded-3xl p-6 animate-float">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Your balance</p>
        <p className="mt-2 font-display text-4xl font-extrabold text-ink">KSh 24,500</p>
        <p className="mt-1 text-sm text-muted">Ready to withdraw</p>
        <div className="mt-5 space-y-2">
          {[
            { label: "Tip from @fan_kenya", amount: "+ KSh 1,000", time: "2m ago" },
            { label: "Tip from anonymous", amount: "+ KSh 500", time: "1h ago" },
            { label: "Withdrawn to KCB", amount: "− KSh 10,000", time: "Yesterday" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-2xl bg-sand px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-ink">{row.label}</p>
                <p className="text-xs text-muted">{row.time}</p>
              </div>
              <p className="font-bold text-brand-600">{row.amount}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-full bg-accent py-3 text-center text-sm font-bold text-ink">
          Withdraw to M-Pesa
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card mx-auto max-w-sm rounded-3xl p-6 animate-float">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl">
          ☕
        </div>
        <div>
          <p className="font-bold text-ink">@ama_creates</p>
          <p className="text-sm text-muted">Writer · Nairobi</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        If my work helped you today, send a tip — it keeps everything free for everyone.
      </p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {["KSh 500", "KSh 1,000", "Custom"].map((amount, i) => (
          <div
            key={amount}
            className={`rounded-xl py-2.5 text-center text-xs font-bold ${
              i === 1 ? "bg-accent text-ink" : "bg-sand text-ink"
            }`}
          >
            {amount}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-full bg-accent py-3 text-center text-sm font-bold text-ink">
        Support @ama_creates
      </div>
      <p className="mt-3 text-center text-xs text-muted">No account needed · Pay with M-Pesa or card</p>
    </div>
  );
}

import { WidgetMiniCard } from "@/widget/mini-card";
import { widgetCountryLabel, widgetPaymentHint } from "@/widget/embed";

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
    <WidgetMiniCard
      username="ama_creates"
      displayName="Ama Creates"
      bio="If my work helped you today, send a tip — it keeps everything free for everyone."
      countryLabel={widgetCountryLabel("KE")}
      currency="KES"
      defaultTipAmountCents={50_000}
      ctaText="Support @ama_creates"
      paymentHint={widgetPaymentHint("KE")}
      className="surface-card mx-auto animate-float"
    />
  );
}

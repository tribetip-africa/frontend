import { buildTipPresets } from "@/lib/tip-amounts";
import { WIDGET_HIGHLIGHT_COLOR, type WidgetPosition } from "@/widget/embed";

export type WidgetMiniCardProps = {
  username: string;
  displayName: string;
  bio?: string | null;
  countryLabel?: string;
  currency: string;
  defaultTipAmountCents: number;
  ctaText: string;
  iconUrl?: string | null;
  paymentHint?: string;
  position?: WidgetPosition;
  className?: string;
  interactive?: boolean;
  onOpen?: () => void;
};

function creatorInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function positionClass(position: WidgetPosition): string {
  switch (position) {
    case "bottom-left":
      return "left-4 bottom-4 sm:left-5 sm:bottom-5";
    case "top-right":
      return "right-4 top-4 sm:right-5 sm:top-5";
    case "top-left":
      return "left-4 top-4 sm:left-5 sm:top-5";
    default:
      return "right-4 bottom-4 sm:right-5 sm:bottom-5";
  }
}

export function WidgetMiniCard({
  username,
  displayName,
  bio,
  countryLabel = "Creator",
  currency,
  defaultTipAmountCents,
  ctaText,
  iconUrl,
  paymentHint = "No account needed · Pay securely online",
  position = "bottom-right",
  className = "",
  interactive = false,
  onOpen,
}: WidgetMiniCardProps) {
  const tipPresets = buildTipPresets(defaultTipAmountCents, currency);
  const bioText =
    bio?.trim() ||
    "If my work helped you today, send a tip — it keeps everything free for everyone.";

  const card = (
    <div
      className={`w-full max-w-[320px] rounded-3xl border border-line bg-white p-5 shadow-[0_2px_16px_rgb(26_26_26/0.06),0_12px_40px_rgb(26_26_26/0.08)] transition hover:-translate-y-0.5 ${
        interactive ? "cursor-pointer" : ""
      } ${className}`}
      {...(interactive
        ? {
            role: "button",
            tabIndex: 0,
            onClick: onOpen,
            onKeyDown: (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen?.();
              }
            },
          }
        : {})}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent-soft">
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-brand-600">{creatorInitials(displayName)}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">@{username}</p>
          <p className="truncate text-sm text-muted">{countryLabel}</p>
        </div>
      </div>

      <p className="mt-3.5 line-clamp-3 text-sm leading-relaxed text-ink-soft">{bioText}</p>

      <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden={interactive ? undefined : true}>
        {tipPresets.map((preset, index) => (
          <div
            key={preset.id}
            className={`rounded-xl py-2.5 text-center text-xs font-bold ${
              index === 1 ? "text-ink" : "bg-sand text-ink"
            }`}
            style={index === 1 ? { backgroundColor: WIDGET_HIGHLIGHT_COLOR } : undefined}
          >
            {preset.label}
          </div>
        ))}
      </div>

      <div
        className="mt-3.5 rounded-full py-3 text-center text-sm font-bold text-ink"
        style={{ backgroundColor: WIDGET_HIGHLIGHT_COLOR }}
      >
        {ctaText}
      </div>

      <p className="mt-2.5 text-center text-xs leading-snug text-muted">{paymentHint}</p>
    </div>
  );

  if (position) {
    return <div className={`absolute ${positionClass(position)}`}>{card}</div>;
  }

  return card;
}

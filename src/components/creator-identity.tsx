import type { PublicProfile } from "@/lib/api";
import { AFRICAN_MARKETS } from "@/lib/constants";

type CreatorIdentityProps = {
  profile: PublicProfile;
};

function creatorInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export function CreatorIdentity({ profile }: CreatorIdentityProps) {
  const market = AFRICAN_MARKETS.find((entry) => entry.code === profile.country_code);
  const locationLabel = market ? `${market.flag} ${market.name}` : profile.country_code;

  return (
    <div className="flex items-start gap-4">
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-xl font-bold text-brand-700"
        aria-hidden
      >
        {creatorInitials(profile.display_name)}
      </div>
      <div className="min-w-0 pt-1">
        <p className="text-sm font-semibold text-brand-600">@{profile.username}</p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-brand-900">
          {profile.display_name}
        </h1>
        <p className="mt-1 text-sm text-brand-700">Creator · {locationLabel}</p>
      </div>
    </div>
  );
}

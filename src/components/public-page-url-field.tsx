"use client";

import { publicPageDisplayUrl, publicPageShareHint } from "@/lib/creator-public-page";
import type { CreatorProfile } from "@/types/api";

type PublicPageUrlFieldProps = {
  username: string;
  profile: CreatorProfile | null;
  shareable: boolean;
};

export function PublicPageUrlField({ username, profile, shareable }: PublicPageUrlFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="public_page_url" className="text-xs font-medium uppercase tracking-wide text-brand-600">
        Public URL
      </label>
      <input
        id="public_page_url"
        readOnly
        value={publicPageDisplayUrl(username, shareable)}
        aria-disabled={!shareable}
        className={`w-full rounded-xl border px-3 py-2 font-mono text-sm ${
          shareable
            ? "border-brand-200 bg-white text-brand-900"
            : "border-brand-100 bg-brand-50 text-brand-500"
        }`}
      />
      <p className="text-xs text-brand-600">{publicPageShareHint(profile)}</p>
    </div>
  );
}

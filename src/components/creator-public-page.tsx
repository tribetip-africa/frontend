import Link from "next/link";
import type { PublicProfile } from "@/lib/api";
import { CreatorIdentity } from "@/components/creator-identity";
import { PublicTipHeader } from "@/components/public-tip-header";
import { PublicTipSection } from "@/components/public-tip-section";
import { SiteFooter } from "@/components/site-footer";

type CreatorPublicPageProps = {
  profile: PublicProfile;
  tipSuccess?: boolean;
  celebrationKey?: string;
};

export function CreatorPublicPage({
  profile,
  tipSuccess = false,
  celebrationKey,
}: CreatorPublicPageProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicTipHeader />
      <main className="pattern-dots relative flex-1 overflow-hidden pb-36">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-brand-200/60 blur-3xl" />

        <div className="relative mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-900/5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Support this creator
            </p>

            <div className="mt-5">
              <CreatorIdentity profile={profile} />
            </div>

            {profile.bio && (
              <p className="mt-5 text-sm leading-relaxed text-brand-800/90">{profile.bio}</p>
            )}

            <div className="mt-6 border-t border-brand-100 pt-6">
              <PublicTipSection
                profile={profile}
                tipSuccess={tipSuccess}
                celebrationKey={celebrationKey}
              />
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-brand-700">
            Powered by{" "}
            <Link href="/" className="font-semibold text-brand-600 hover:underline">
              TribeTip
            </Link>
            {" · "}
            Built for creators across Africa
          </p>
        </div>
      </main>
      <SiteFooter fixed />
    </div>
  );
}

import Link from "next/link";
import type { PublicProfile } from "@/lib/api";
import { CreatorIdentity } from "@/components/creator-identity";
import { PublicTipHeader } from "@/components/public-tip-header";
import { PublicTipSection } from "@/components/public-tip-section";

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
    <div className="flex min-h-dvh flex-col bg-cream">
      <PublicTipHeader />
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-md">
          <div className="surface-card rounded-3xl p-6 sm:p-8">
            <CreatorIdentity profile={profile} />

            {profile.bio && (
              <p className="mt-4 text-center text-sm leading-relaxed text-ink-soft">{profile.bio}</p>
            )}

            <div className="mt-6 border-t border-line pt-6">
              <PublicTipSection
                profile={profile}
                tipSuccess={tipSuccess}
                celebrationKey={celebrationKey}
              />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/" className="font-semibold text-ink hover:underline">
              Create your own TribeTip page
            </Link>
            {" — it's free"}
          </p>
        </div>
      </main>
    </div>
  );
}

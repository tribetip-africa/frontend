import Link from "next/link";
import { PublicPageUrlField } from "@/components/public-page-url-field";
import { Button } from "@/components/ui/button";
import type { CreatorProfile } from "@/types/api";

type CreatorSharePromoProps = {
  username: string;
  profile: CreatorProfile | null;
  shareable: boolean;
};

export function CreatorSharePromo({ username, profile, shareable }: CreatorSharePromoProps) {
  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-brand-900">Your public page</h2>
          <p className="mt-1 text-sm text-brand-700">
            Copy your link, download your QR code, and edit your profile on the public page settings.
          </p>
        </div>
        <Link href="/dashboard/public-page">
          <Button variant="primary" type="button">
            Manage page
          </Button>
        </Link>
      </div>

      <div className="mt-4">
        <PublicPageUrlField username={username} profile={profile} shareable={shareable} />
      </div>
    </section>
  );
}

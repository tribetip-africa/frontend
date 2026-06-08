import { cache } from "react";
import { notFound } from "next/navigation";
import { CreatorPublicPage } from "@/components/creator-public-page";
import { fetchPublicProfile, reconcileTipPayment } from "@/lib/api";
import { TribetipApiError } from "@/lib/errors";

const loadPublicProfile = cache(async (username: string) => fetchPublicProfile(username));

type CreatorPageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tip?: string; reference?: string; trxref?: string }>;
};

export async function generateMetadata({ params }: CreatorPageProps) {
  const { username } = await params;

  try {
    const profile = await loadPublicProfile(username);
    return {
      title: `Tip ${profile.display_name} on TribeTip`,
      description:
        profile.bio ?? `Support ${profile.display_name} with a secure tip via card or mobile money.`,
    };
  } catch {
    return { title: `@${username} · TribeTip` };
  }
}

export default async function CreatorPage({ params, searchParams }: CreatorPageProps) {
  const { username } = await params;
  const { tip: tipStatus, reference, trxref } = await searchParams;
  const paystackReference = trxref || reference;

  if (tipStatus === "success" && paystackReference) {
    try {
      await reconcileTipPayment(paystackReference);
    } catch {
      // Webhook or a later reconcile attempt may still mark the tip paid.
    }
  }

  let profile;

  try {
    profile = await loadPublicProfile(username);
  } catch (error) {
    if (error instanceof TribetipApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <CreatorPublicPage
      profile={profile}
      tipSuccess={tipStatus === "success"}
      celebrationKey={paystackReference ?? undefined}
    />
  );
}

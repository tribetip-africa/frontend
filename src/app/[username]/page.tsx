import { cache } from "react";
import { notFound } from "next/navigation";
import { CreatorPublicPage } from "@/components/creator-public-page";
import { JsonLd } from "@/components/json-ld";
import { fetchPublicProfile, reconcileTipPayment } from "@/lib/api";
import { TribetipApiError } from "@/lib/errors";
import { isValidPublicUsername } from "@/lib/public-tip-path";
import { buildCreatorProfileJsonLd } from "@/lib/seo-schema";
import { buildCreatorMetadata, buildCreatorMetadataFallback } from "@/lib/seo";

const loadPublicProfile = cache(async (username: string) => fetchPublicProfile(username));

type CreatorPageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tip?: string; reference?: string; trxref?: string }>;
};

export async function generateMetadata({ params }: CreatorPageProps) {
  const { username } = await params;

  if (!isValidPublicUsername(username)) {
    notFound();
  }

  try {
    const profile = await loadPublicProfile(username);
    return buildCreatorMetadata(profile);
  } catch {
    return buildCreatorMetadataFallback(username);
  }
}

export default async function CreatorPage({ params, searchParams }: CreatorPageProps) {
  const { username } = await params;

  if (!isValidPublicUsername(username)) {
    notFound();
  }

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
    <>
      <JsonLd data={buildCreatorProfileJsonLd(profile)} />
      <CreatorPublicPage
        profile={profile}
        tipSuccess={tipStatus === "success"}
        celebrationKey={paystackReference ?? undefined}
      />
    </>
  );
}

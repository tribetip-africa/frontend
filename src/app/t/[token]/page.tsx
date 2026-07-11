import { notFound } from "next/navigation";
import { CreatorPublicPage } from "@/components/creator-public-page";
import { fetchPublicProfileByShareToken, reconcileTipPayment } from "@/lib/api";
import { TribetipApiError } from "@/lib/errors";
import { isValidShareToken } from "@/lib/share-link";
import { buildPrivatePageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function loadPublicProfileByShareToken(token: string) {
  return fetchPublicProfileByShareToken(token);
}

type ShareTipPageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ tip?: string; reference?: string; trxref?: string }>;
};

export async function generateMetadata({ params }: ShareTipPageProps) {
  const { token } = await params;

  if (!isValidShareToken(token)) {
    return { title: "Tip on TribeTip" };
  }

  try {
    const profile = await loadPublicProfileByShareToken(token);
    return buildPrivatePageMetadata({
      title: `Tip ${profile.display_name}`,
      description:
        profile.bio ?? `Support ${profile.display_name} with a secure tip via card or mobile money.`,
      path: `/t/${token}`,
    });
  } catch {
    return buildPrivatePageMetadata({
      title: "Tip on TribeTip",
      path: `/t/${token}`,
    });
  }
}

export default async function ShareTipPage({ params, searchParams }: ShareTipPageProps) {
  const { token } = await params;
  const { tip: tipStatus, reference, trxref } = await searchParams;
  const paystackReference = trxref || reference;

  if (!isValidShareToken(token)) {
    notFound();
  }

  if (tipStatus === "success" && paystackReference) {
    try {
      await reconcileTipPayment(paystackReference);
    } catch {
      // Webhook or a later reconcile attempt may still mark the tip paid.
    }
  }

  let profile;

  try {
    profile = await loadPublicProfileByShareToken(token);
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

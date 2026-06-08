"use client";

import type { PublicProfile } from "@/lib/api";
import { TipForm } from "@/components/tip-form";
import { TipSuccessConfetti } from "@/components/tip-success-confetti";

type PublicTipSectionProps = {
  profile: PublicProfile;
  tipSuccess?: boolean;
  celebrationKey?: string;
};

export function PublicTipSection({
  profile,
  tipSuccess = false,
  celebrationKey,
}: PublicTipSectionProps) {
  const introVisible = !tipSuccess;

  return (
    <>
      <TipSuccessConfetti active={tipSuccess} celebrationKey={celebrationKey} />
      {introVisible && (
        <p className="mb-4 text-sm text-brand-700">
          Send a tip in seconds — pay securely with card or mobile money.
        </p>
      )}
      <TipForm profile={profile} showSuccess={tipSuccess} />
    </>
  );
}

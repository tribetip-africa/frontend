"use client";

import { useEffect } from "react";
import { PaystackOnboardingWizard } from "@/components/paystack-onboarding-wizard";

import type { Tribe } from "@/types/api";

type PaystackOnboardingModalProps = {
  open: boolean;
  token: string | null;
  username: string;
  onComplete: (tribe: Tribe) => void;
};

export function PaystackOnboardingModal({
  open,
  token,
  username,
  onComplete,
}: PaystackOnboardingModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-brand-950/50 backdrop-blur-md"
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paystack-onboarding-title"
        className="relative z-10 flex max-h-[min(94dvh,920px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-2xl"
      >
        <div className="shrink-0 border-b border-brand-100 px-6 py-4 sm:px-8">
          <h2 id="paystack-onboarding-title" className="text-xl font-bold text-brand-900">
            Set up payouts
          </h2>
          <p className="mt-1.5 text-sm text-brand-700">
            Link your Paystack customer profile and payout account before you can receive tips.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 sm:px-8 sm:py-5">
          <PaystackOnboardingWizard token={token} username={username} onComplete={onComplete} />
        </div>
      </div>
    </div>
  );
}

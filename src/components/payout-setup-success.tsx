"use client";

import { useEffect } from "react";
import { AnimatedCheckmark } from "@/components/animated-checkmark";
import { fireConfetti } from "@/lib/confetti";

type PayoutSetupSuccessProps = {
  visible: boolean;
  onDismiss: () => void;
};

export function PayoutSetupSuccess({ visible, onDismiss }: PayoutSetupSuccessProps) {
  useEffect(() => {
    if (!visible) return;

    fireConfetti();

    const timer = window.setTimeout(onDismiss, 6000);
    return () => window.clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex max-w-md items-start gap-4 rounded-2xl border border-green-200 bg-white p-4 shadow-xl shadow-brand-900/10 sm:items-center sm:p-5">
        <div className="shrink-0 scale-75 sm:scale-90">
          <AnimatedCheckmark />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-brand-900">Payout account linked</p>
          <p className="mt-1 text-sm text-brand-700">
            Your Paystack payout setup is complete. Finish your profile below to start receiving
            tips.
          </p>
        </div>
        <button
          type="button"
          className="pointer-events-auto shrink-0 text-sm font-medium text-brand-600 hover:text-brand-800"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

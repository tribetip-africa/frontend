"use client";

import { usePaystackPayout } from "@/hooks/use-paystack-payout";
import { PaystackPayoutStatusPanel } from "@/components/paystack-payout-status-panel";

type PaystackPayoutStatusProps = {
  token: string;
};

export function PaystackPayoutStatus({ token }: PaystackPayoutStatusProps) {
  const payoutState = usePaystackPayout(token);

  return <PaystackPayoutStatusPanel {...payoutState} onRefresh={() => void payoutState.refresh()} />;
}

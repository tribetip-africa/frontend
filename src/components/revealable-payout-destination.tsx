"use client";

import { RevealableAccountNumber } from "@/components/revealable-account-number";
import { formatPayoutDestination, parsePayoutDestination } from "@/lib/payout-destination";

type RevealablePayoutDestinationProps = {
  destination: string;
  token?: string | null;
  className?: string;
  mono?: boolean;
};

export function RevealablePayoutDestination({
  destination,
  token,
  className = "",
  mono = false,
}: RevealablePayoutDestinationProps) {
  const { label, account } = parsePayoutDestination(destination);

  return (
    <span className={className}>
      {label ? `${label} · ` : null}
      <RevealableAccountNumber value={account} token={token} mono={mono} />
    </span>
  );
}

export function revealPayoutDestination(
  destination: string,
  fullAccountNumber: string,
): string {
  const { label } = parsePayoutDestination(destination);
  return formatPayoutDestination(label, fullAccountNumber);
}

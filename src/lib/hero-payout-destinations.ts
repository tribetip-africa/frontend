export type HeroPayoutMethod = {
  id: string;
  label: string;
};

/** One payout rail per rotator slide — no compound "X or your bank" copy. */
export const HERO_PAYOUT_METHODS: HeroPayoutMethod[] = [
  { id: "mpesa", label: "M-Pesa" },
  { id: "mtn-momo", label: "MTN MoMo" },
  { id: "orange-money", label: "Orange Money" },
  { id: "vodafone-cash", label: "Vodafone Cash" },
  { id: "airtel-money", label: "Airtel Money" },
  { id: "bank-transfer", label: "Bank Transfer" },
  { id: "eft", label: "EFT" },
  { id: "debit-card", label: "Debit Card" },
];

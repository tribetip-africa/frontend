import type { PaystackBank, PaystackMarket } from "@/types/api";

type PayoutSetupLabels = {
  settlementProvider: { bank: string; mobileMoney: string };
  accountNumber: { bank: string; mobileMoney: string };
  intro: { bank: (currency: string) => string; mobileMoney: (currency: string, providerName: string) => string };
  accountHint?: string;
  incompleteHint: { bank: string; mobileMoney: string };
  accountPlaceholder?: { bank?: string; mobileMoney?: string };
};

export type PayoutSetupMarketConfig = {
  preferredBankCode?: string;
  sortMobileMoneyFirst: boolean;
  labels: PayoutSetupLabels;
};

const MARKET_CONFIG: Record<string, PayoutSetupMarketConfig> = {
  NG: {
    sortMobileMoneyFirst: false,
    labels: {
      settlementProvider: { bank: "Settlement bank", mobileMoney: "Mobile money provider" },
      accountNumber: { bank: "Account number", mobileMoney: "Mobile money number" },
      intro: {
        bank: (currency) =>
          `Add the Nigerian bank account where tips should settle in ${currency}. TribeTip creates a Paystack subaccount linked to your customer profile.`,
        mobileMoney: (currency, providerName) =>
          `Link your ${providerName} wallet where tips should settle in ${currency}.`,
      },
      incompleteHint: {
        bank: "Select a settlement bank and enter your account number to continue.",
        mobileMoney: "Select a mobile money provider and enter your wallet number to continue.",
      },
    },
  },
  GH: {
    preferredBankCode: "MTN",
    sortMobileMoneyFirst: true,
    labels: {
      settlementProvider: { bank: "Settlement bank", mobileMoney: "Mobile money provider" },
      accountNumber: { bank: "Account number", mobileMoney: "MoMo wallet number" },
      intro: {
        bank: (currency) =>
          `Add the Ghanaian bank account where tips should settle in ${currency}. TribeTip creates a Paystack subaccount linked to your customer profile.`,
        mobileMoney: (currency, providerName) =>
          `Link the ${providerName} wallet where tips should settle in ${currency}. TribeTip creates a Paystack subaccount for that mobile wallet.`,
      },
      accountPlaceholder: { mobileMoney: "0241234567" },
      incompleteHint: {
        bank: "Select a settlement bank and enter your account number to continue.",
        mobileMoney: "Choose a mobile money provider and enter your MoMo wallet number to continue.",
      },
    },
  },
  KE: {
    preferredBankCode: "MPESA",
    sortMobileMoneyFirst: true,
    labels: {
      settlementProvider: { bank: "Settlement bank", mobileMoney: "Mobile money provider" },
      accountNumber: { bank: "Account number", mobileMoney: "Safaricom line (M-Pesa)" },
      intro: {
        bank: (currency) =>
          `Add the Kenyan bank account where tips should settle in ${currency}. TribeTip creates a Paystack subaccount linked to your customer profile.`,
        mobileMoney: (currency, providerName) =>
          `Link the ${providerName} line where tips should settle in ${currency}. TribeTip creates a Paystack subaccount for that mobile wallet.`,
      },
      accountHint: "Use the Kenyan Safaricom number registered to your M-Pesa wallet (e.g. 07XX XXX XXX).",
      accountPlaceholder: { mobileMoney: "0712345678" },
      incompleteHint: {
        bank: "Select a settlement bank and enter your account number to continue.",
        mobileMoney: "Choose M-Pesa and enter your Safaricom line to enable payout setup.",
      },
    },
  },
  ZA: {
    sortMobileMoneyFirst: false,
    labels: {
      settlementProvider: { bank: "Settlement bank", mobileMoney: "Mobile money provider" },
      accountNumber: { bank: "Account number", mobileMoney: "Mobile money number" },
      intro: {
        bank: (currency) =>
          `Add the South African bank account where tips should settle in ${currency}. TribeTip creates a Paystack subaccount linked to your customer profile.`,
        mobileMoney: (currency, providerName) =>
          `Link your ${providerName} wallet where tips should settle in ${currency}.`,
      },
      incompleteHint: {
        bank: "Select a settlement bank and enter your account number to continue.",
        mobileMoney: "Select a mobile money provider and enter your wallet number to continue.",
      },
    },
  },
};

const DEFAULT_CONFIG = MARKET_CONFIG.KE!;

export function payoutSetupConfig(market: PaystackMarket | null | undefined): PayoutSetupMarketConfig {
  if (!market) return DEFAULT_CONFIG;
  return MARKET_CONFIG[market.country_code] ?? DEFAULT_CONFIG;
}

export function marketSupportsMobileMoney(market: PaystackMarket | null | undefined): boolean {
  return market?.mobile_money_supported === true;
}

export function isMobileMoneyBank(
  bank: PaystackBank | undefined,
  market: PaystackMarket | null | undefined,
): boolean {
  return marketSupportsMobileMoney(market) && bank?.mobile_money === true;
}

export function sortSettlementBanks(
  banks: PaystackBank[],
  market: PaystackMarket | null | undefined,
): PaystackBank[] {
  const config = payoutSetupConfig(market);
  return [...banks].sort((left, right) => {
    if (left.mobile_money === right.mobile_money) {
      return left.name.localeCompare(right.name);
    }

    if (config.sortMobileMoneyFirst) {
      return left.mobile_money ? -1 : 1;
    }

    return left.mobile_money ? 1 : -1;
  });
}

export function pickDefaultSettlementBank(
  banks: PaystackBank[],
  market: PaystackMarket | null | undefined,
): PaystackBank | undefined {
  const config = payoutSetupConfig(market);
  if (config.preferredBankCode) {
    const preferred = banks.find((bank) => bank.code === config.preferredBankCode);
    if (preferred) return preferred;
  }

  if (marketSupportsMobileMoney(market) && config.sortMobileMoneyFirst) {
    return banks.find((bank) => bank.mobile_money) ?? banks[0];
  }

  return banks.find((bank) => !bank.mobile_money) ?? banks[0];
}

export type PayoutFormCopy = {
  intro: string;
  settlementProviderLabel: string;
  accountNumberLabel: string;
  accountHint?: string;
  accountPlaceholder?: string;
  incompleteHint: string;
};

export function payoutFormCopy(
  market: PaystackMarket | null | undefined,
  bank: PaystackBank | undefined,
): PayoutFormCopy {
  const config = payoutSetupConfig(market);
  const currency = market?.currency ?? "";
  const mobileMoney = isMobileMoneyBank(bank, market);
  const providerName = bank?.name ?? "mobile money";

  return {
    intro: mobileMoney
      ? config.labels.intro.mobileMoney(currency, providerName)
      : config.labels.intro.bank(currency),
    settlementProviderLabel: mobileMoney
      ? config.labels.settlementProvider.mobileMoney
      : config.labels.settlementProvider.bank,
    accountNumberLabel: mobileMoney
      ? config.labels.accountNumber.mobileMoney
      : config.labels.accountNumber.bank,
    accountHint: mobileMoney ? config.labels.accountHint : undefined,
    accountPlaceholder: mobileMoney
      ? config.labels.accountPlaceholder?.mobileMoney
      : config.labels.accountPlaceholder?.bank,
    incompleteHint: mobileMoney
      ? config.labels.incompleteHint.mobileMoney
      : config.labels.incompleteHint.bank,
  };
}

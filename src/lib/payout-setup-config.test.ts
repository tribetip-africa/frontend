import {
  isMobileMoneyBank,
  payoutFormCopy,
  pickDefaultSettlementBank,
  sortSettlementBanks,
} from "@/lib/payout-setup-config";
import type { PaystackBank, PaystackMarket } from "@/types/api";

const nigeriaMarket: PaystackMarket = {
  country_code: "NG",
  name: "Nigeria",
  currency: "NGN",
  paystack_bank_country: "nigeria",
  subaccount_supported: true,
  mobile_money_supported: false,
};

const kenyaMarket: PaystackMarket = {
  country_code: "KE",
  name: "Kenya",
  currency: "KES",
  paystack_bank_country: "kenya",
  subaccount_supported: true,
  mobile_money_supported: true,
};

const zenithBank: PaystackBank = { name: "Zenith Bank", code: "057" };
const mpesaBank: PaystackBank = {
  name: "M-PESA",
  code: "MPESA",
  mobile_money: true,
};

describe("payout setup config", () => {
  it("does not treat mobile money banks as mobile money payouts in Nigeria", () => {
    expect(isMobileMoneyBank(mpesaBank, nigeriaMarket)).toBe(false);
  });

  it("uses bank-only copy for Nigerian creators", () => {
    const copy = payoutFormCopy(nigeriaMarket, zenithBank);

    expect(copy.intro).toMatch(/Nigerian bank account/);
    expect(copy.accountNumberLabel).toBe("Account number");
    expect(copy.incompleteHint).toMatch(/settlement bank/);
    expect(copy.intro).not.toMatch(/M-Pesa/i);
  });

  it("prefers bank accounts over mobile money in Nigeria", () => {
    const banks = sortSettlementBanks([mpesaBank, zenithBank], nigeriaMarket);

    expect(banks[0]?.code).toBe("057");
    expect(pickDefaultSettlementBank(banks, nigeriaMarket)?.code).toBe("057");
  });

  it("uses M-Pesa copy and defaults for Kenya", () => {
    const banks = sortSettlementBanks(
      [{ name: "KCB Bank", code: "68" }, mpesaBank],
      kenyaMarket,
    );

    expect(banks[0]?.code).toBe("MPESA");
    expect(pickDefaultSettlementBank(banks, kenyaMarket)?.code).toBe("MPESA");

    const copy = payoutFormCopy(kenyaMarket, mpesaBank);
    expect(copy.accountNumberLabel).toMatch(/M-Pesa/i);
    expect(copy.accountHint).toMatch(/Safaricom/i);
  });
});

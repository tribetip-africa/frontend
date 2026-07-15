"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { completePaystackOnboarding, fetchPaystackOnboarding } from "@/lib/api";
import { createIdempotencyKey } from "@/lib/idempotency-key";
import { getDisplayMessage } from "@/lib/errors";
import { setStoredAuth, getStoredToken, getStoredTribe } from "@/lib/auth-storage";
import { mergeTribeOnboarding } from "@/lib/paystack-onboarding";
import {
  isMobileMoneyBank,
  payoutFormCopy,
  pickDefaultSettlementBank,
  sortSettlementBanks,
} from "@/lib/payout-setup-config";
import {
  clearReferralCode,
  getReferralCode,
  normalizeReferralCode,
} from "@/lib/referral-attribution";
import type {
  PaystackBank,
  PaystackMarket,
  PaystackOnboarding,
  PaystackVerificationCheck,
  Tribe,
} from "@/types/api";
import { Button } from "@/components/ui/button";
import { PaystackVerificationChecks } from "@/components/paystack-verification-checks";

type PaystackOnboardingWizardProps = {
  token: string | null;
  username: string;
  onComplete?: (tribe: Tribe) => void;
};

export function PaystackOnboardingWizard({ token, username, onComplete }: PaystackOnboardingWizardProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerReady, setCustomerReady] = useState(false);
  const [subaccountReady, setSubaccountReady] = useState(false);
  const [market, setMarket] = useState<PaystackMarket | null>(null);
  const [banks, setBanks] = useState<PaystackBank[]>([]);
  const [settlementBank, setSettlementBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [referralCode, setReferralCode] = useState(() => getReferralCode() ?? "");
  const [referralAttached, setReferralAttached] = useState(
    () => Boolean(getStoredTribe()?.referral_attached),
  );
  const [verification, setVerification] = useState<PaystackVerificationCheck[]>([]);
  const onboardingIdempotencyKey = useRef<string | null>(null);
  const completedRef = useRef(false);
  const pollInFlightRef = useRef(false);

  const finishOnboarding = useCallback(
    (onboarding: PaystackOnboarding, tribe?: Tribe) => {
      if (!onboarding.subaccount_ready || completedRef.current) return;

      const sessionToken = getStoredToken();
      const storedTribe = getStoredTribe();
      if (!storedTribe) return;

      completedRef.current = true;

      const updatedTribe = tribe
        ? mergeTribeOnboarding(tribe, onboarding)
        : mergeTribeOnboarding(
            {
              ...storedTribe,
              paystack_onboarding: storedTribe.paystack_onboarding,
            } as Tribe,
            onboarding,
          );

      setStoredAuth(sessionToken, updatedTribe);
      onComplete?.(updatedTribe);
    },
    [onComplete],
  );

  const applyPayload = useCallback(
    (payload: { onboarding: PaystackOnboarding; market: PaystackMarket; banks: PaystackBank[] }) => {
      setCustomerReady(payload.onboarding.customer_ready);
      setSubaccountReady(payload.onboarding.subaccount_ready);
      setVerification(payload.onboarding.verification ?? []);
      if (payload.onboarding.provisioning_error) {
        setError(payload.onboarding.provisioning_error);
      }
      setMarket(payload.market);
      const sortedBanks = sortSettlementBanks(payload.banks, payload.market);
      setBanks(sortedBanks);
      const defaultBank = pickDefaultSettlementBank(sortedBanks, payload.market);
      setSettlementBank((current) => current || defaultBank?.code || "");

      if (payload.onboarding.subaccount_ready) {
        finishOnboarding(payload.onboarding);
      }
    },
    [finishOnboarding],
  );

  const pollStatus = useCallback(async () => {
    if (pollInFlightRef.current) return;

    pollInFlightRef.current = true;
    try {
      const payload = await fetchPaystackOnboarding(token);
      applyPayload(payload);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      pollInFlightRef.current = false;
    }
  }, [applyPayload, token]);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchPaystackOnboarding(token);
      applyPayload(payload);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [applyPayload, token]);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const payload = await fetchPaystackOnboarding(token);
        if (!active) return;
        applyPayload(payload);
      } catch (err) {
        if (!active) return;
        setError(getDisplayMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [applyPayload, token]);

  useEffect(() => {
    if (loading || customerReady || subaccountReady) return;

    const timer = window.setInterval(() => {
      void pollStatus();
    }, 8000);

    return () => window.clearInterval(timer);
  }, [loading, customerReady, subaccountReady, pollStatus]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const idempotencyKey = onboardingIdempotencyKey.current ?? createIdempotencyKey();
      onboardingIdempotencyKey.current = idempotencyKey;
      const normalizedReferral = normalizeReferralCode(referralCode);

      const { onboarding: status, tribe } = await completePaystackOnboarding(
        token,
        {
          settlement_bank: settlementBank.trim(),
          account_number: accountNumber.trim(),
          business_name: businessName.trim() || username,
          ...(normalizedReferral && !referralAttached
            ? { referral_code: normalizedReferral }
            : {}),
        },
        idempotencyKey,
      );

      setCustomerReady(status.customer_ready);
      setSubaccountReady(status.subaccount_ready);
      setVerification(status.verification ?? []);
      if (tribe.referral_attached) {
        setReferralAttached(true);
        clearReferralCode();
      }

      if (status.subaccount_ready) {
        finishOnboarding(status, tribe);
      }
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-brand-700">Checking Paystack setup…</p>
        <p className="text-xs text-brand-600">
          We&apos;re linking your Paystack customer profile in the background. This usually takes a
          few seconds.
        </p>
      </div>
    );
  }

  const subaccountSupported = market?.subaccount_supported ?? true;
  const selectedBank =
    banks.find((bank) => bank.code === settlementBank) ??
    banks.find((bank) => bank.code === settlementBank.trim());
  const mobileMoneyPayout = isMobileMoneyBank(selectedBank, market);
  const formCopy = payoutFormCopy(market, selectedBank);
  const payoutDetailsComplete =
    settlementBank.trim().length > 0 && accountNumber.trim().length > 0;
  const submitDisabled = submitting || !payoutDetailsComplete;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {market && (
          <p className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-2.5 text-sm text-brand-800 lg:col-span-2">
            Payout market: <span className="font-medium">{market.name}</span> ·{" "}
            <span className="font-medium">{market.currency}</span>
          </p>
        )}

        <section className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
          <h2 className="font-medium text-brand-900">Paystack account checks</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-brand-800">
            <li>{customerReady ? "✓" : "…"} Paystack customer linked</li>
            <li>{subaccountReady ? "✓" : "…"} Paystack subaccount linked for tips</li>
          </ul>
          {!customerReady && subaccountSupported && (
            <p className="mt-2 text-xs text-brand-600" role="status">
              Linking your Paystack customer profile… You can enter payout details while we finish
              setup.
            </p>
          )}
          {verification.length > 0 && (
            <div className="mt-3 border-t border-brand-100 pt-2.5">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                Verification
              </p>
              <PaystackVerificationChecks checks={verification} />
            </div>
          )}
          {!customerReady && (
            <Button type="button" variant="secondary" className="mt-3" onClick={refreshStatus}>
              Retry customer check
            </Button>
          )}
        </section>

        {error && (
          <section
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 lg:col-span-2"
            role="alert"
          >
            <p className="font-medium">Payout setup issue</p>
            <p className="mt-1">{error}</p>
            {error.toLowerCase().includes("email") && (
              <p className="mt-2 text-xs">
                Paystack requires a real email on your account. Sign up again with an address like{" "}
                <span className="font-medium">you@gmail.com</span>.
              </p>
            )}
          </section>
        )}

        {!subaccountSupported && !subaccountReady && (
          <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 lg:col-span-2">
            Payout setup for {market?.name ?? "your market"} is not available yet. Subaccounts and
            tips are coming soon for this region.
          </section>
        )}

        {!subaccountReady && subaccountSupported && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
          <p className="text-sm text-brand-700">{formCopy.intro}</p>

          <div>
            <label htmlFor="business_name" className="mb-1.5 block text-sm font-medium text-brand-800">
              Business / display name
            </label>
            <input
              id="business_name"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-900"
              placeholder={username}
            />
          </div>

          <div>
            <label htmlFor="settlement_bank" className="mb-1.5 block text-sm font-medium text-brand-800">
              {formCopy.settlementProviderLabel}
            </label>
            {banks.length > 0 ? (
              <select
                id="settlement_bank"
                value={settlementBank}
                onChange={(event) => setSettlementBank(event.target.value)}
                required
                className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-900"
              >
                {banks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name} ({bank.code})
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="settlement_bank"
                value={settlementBank}
                onChange={(event) => setSettlementBank(event.target.value)}
                required
                className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-900"
                placeholder="Bank code"
              />
            )}
          </div>

          <div>
            <label htmlFor="account_number" className="mb-1.5 block text-sm font-medium text-brand-800">
              {formCopy.accountNumberLabel}
            </label>
            <input
              id="account_number"
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              required
              inputMode={mobileMoneyPayout ? "tel" : "numeric"}
              placeholder={formCopy.accountPlaceholder}
              className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-900"
            />
            {formCopy.accountHint && (
              <p className="mt-1 text-xs text-brand-600">{formCopy.accountHint}</p>
            )}
          </div>

          {!referralAttached && (
            <div>
              <label htmlFor="referral_code" className="mb-1.5 block text-sm font-medium text-brand-800">
                Referral code <span className="font-normal text-brand-600">(optional)</span>
              </label>
              <input
                id="referral_code"
                value={referralCode}
                onChange={(event) => setReferralCode(event.target.value)}
                autoComplete="off"
                className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-900"
                placeholder="Paste a link code or @username"
              />
              <p className="mt-1 text-xs text-brand-600">
                Invited by a creator? Add their code here. You can leave this blank.
              </p>
            </div>
          )}

          {!customerReady && payoutDetailsComplete && (
            <p className="text-xs text-brand-600">
              Paystack is still linking your customer profile. You can submit your payout details
              now — we&apos;ll finish setup in one step.
            </p>
          )}

          {!payoutDetailsComplete && (
            <p className="text-xs text-brand-600">{formCopy.incompleteHint}</p>
          )}

          <Button
            type="submit"
            disabled={submitDisabled}
            className="w-full"
          >
            {submitting ? "Linking payout account…" : "Link payout account"}
          </Button>
          {submitting && (
            <p className="text-xs text-brand-600" role="status">
              Paystack is creating your payout subaccount. This may take up to 30 seconds.
            </p>
          )}
          </form>
        )}
      </div>

    </div>
  );
}

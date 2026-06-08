"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPaystackOnboarding } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import type { PaystackOnboardingPayload } from "@/types/api";

export function usePaystackPayout(token: string) {
  const [payload, setPayload] = useState<PaystackOnboardingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const next = await fetchPaystackOnboarding(token);
      setPayload(next);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { payload, error, loading, refresh };
}

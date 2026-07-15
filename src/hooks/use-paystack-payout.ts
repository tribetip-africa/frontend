"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPaystackOnboarding } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { runAfterPaint } from "@/lib/run-after-paint";
import type { PaystackOnboardingPayload } from "@/types/api";

export function usePaystackPayout(token: string | null) {
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
    runAfterPaint(() => refresh());
  }, [refresh]);

  return { payload, error, loading, refresh };
}

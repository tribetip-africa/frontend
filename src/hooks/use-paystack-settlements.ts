"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPaystackSettlements } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { runAfterPaint } from "@/lib/run-after-paint";
import type { PaystackSettlementsPayload } from "@/types/api";

type UsePaystackSettlementsOptions = {
  refresh?: boolean;
};

export function usePaystackSettlements(
  token: string | null,
  options: UsePaystackSettlementsOptions = {},
) {
  const refreshOnLoad = options.refresh ?? true;
  const [payload, setPayload] = useState<PaystackSettlementsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const next = await fetchPaystackSettlements(token, { refresh: true });
      setPayload(next);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const next = await fetchPaystackSettlements(token, { refresh: refreshOnLoad });
      setPayload(next);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [refreshOnLoad, token]);

  useEffect(() => {
    runAfterPaint(() => load());
  }, [load]);

  return { payload, error, loading, refresh };
}

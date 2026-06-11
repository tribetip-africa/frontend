"use client";

import { useCallback, useEffect, useState } from "react";
import { createPaystackWithdrawal, fetchPaystackWithdrawals } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { runAfterPaint } from "@/lib/run-after-paint";
import type { PaystackWithdrawalsPayload } from "@/types/api";

export function usePaystackWithdrawals(token: string) {
  const [payload, setPayload] = useState<PaystackWithdrawalsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const next = await fetchPaystackWithdrawals(token, { refresh: true });
      setPayload(next);
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const withdraw = useCallback(async () => {
    setWithdrawing(true);
    setError(null);

    try {
      const result = await createPaystackWithdrawal(token);
      setPayload({
        status: result.status,
        withdrawals: [result.withdrawal, ...(payload?.withdrawals ?? [])],
      });
      return result;
    } catch (err) {
      setError(getDisplayMessage(err));
      throw err;
    } finally {
      setWithdrawing(false);
    }
  }, [token, payload?.withdrawals]);

  useEffect(() => {
    runAfterPaint(() => refresh());
  }, [refresh]);

  return { payload, error, loading, withdrawing, refresh, withdraw };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMyTips, repairPaystackData } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { runAfterPaint } from "@/lib/run-after-paint";
import { usePaystackPayout } from "@/hooks/use-paystack-payout";
import { usePaystackSettlements } from "@/hooks/use-paystack-settlements";
import { usePaystackWithdrawals } from "@/hooks/use-paystack-withdrawals";
import type { PaystackRepairResult, Tip } from "@/types/api";

export function useCreatorOverviewData(token: string) {
  const {
    payload: payoutPayload,
    error: payoutError,
    loading: payoutLoading,
    refresh: refreshPayout,
  } = usePaystackPayout(token);
  const {
    payload: withdrawalsPayload,
    error: withdrawalsError,
    loading: withdrawalsLoading,
    refresh: refreshWithdrawals,
  } = usePaystackWithdrawals(token);
  const {
    payload: settlementsPayload,
    error: settlementsError,
    loading: settlementsLoading,
    refresh: refreshSettlements,
  } = usePaystackSettlements(token);

  const withdrawalStatus = withdrawalsPayload?.status ?? null;
  const settlements = settlementsPayload?.settlements ?? [];
  const [tips, setTips] = useState<Tip[]>([]);
  const [tipsLoading, setTipsLoading] = useState(true);
  const [tipsError, setTipsError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<PaystackRepairResult | null>(null);

  const loadTips = useCallback(async () => {
    setTipsLoading(true);
    setTipsError(null);

    try {
      setTips(await fetchMyTips(token));
    } catch (err) {
      setTipsError(getDisplayMessage(err));
    } finally {
      setTipsLoading(false);
    }
  }, [token]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshPayout(), refreshWithdrawals(), refreshSettlements(), loadTips()]);
  }, [refreshPayout, refreshWithdrawals, refreshSettlements, loadTips]);

  const syncWithPaystack = useCallback(async () => {
    setSyncing(true);
    setSyncError(null);

    try {
      const payload = await repairPaystackData(token);
      setLastSyncResult(payload.repair);
      await refreshAll();
    } catch (err) {
      setSyncError(getDisplayMessage(err));
    } finally {
      setSyncing(false);
    }
  }, [token, refreshAll]);

  useEffect(() => {
    runAfterPaint(() => loadTips());
  }, [loadTips]);

  const loading = payoutLoading || withdrawalsLoading || settlementsLoading || tipsLoading;
  const paystackError = payoutError ?? withdrawalsError ?? settlementsError;

  return {
    payoutPayload,
    payoutError,
    payoutLoading,
    withdrawalStatus,
    withdrawalsError,
    withdrawalsLoading,
    settlements,
    settlementsError,
    settlementsLoading,
    tips,
    tipsLoading,
    tipsError,
    loading,
    paystackError,
    syncing,
    syncError,
    lastSyncResult,
    refreshAll,
    syncWithPaystack,
  };
}

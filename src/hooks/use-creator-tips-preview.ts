"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMyTips } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { runAfterPaint } from "@/lib/run-after-paint";
import type { Tip } from "@/types/api";

const PREVIEW_LIMIT = 5;

export function useCreatorTipsPreview(token: string | null, refreshSignal = 0) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTips = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setTips(await fetchMyTips(token));
    } catch (err) {
      setError(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    runAfterPaint(() => loadTips());
  }, [loadTips, refreshSignal]);

  return {
    tips,
    previewTips: tips.slice(0, PREVIEW_LIMIT),
    loading,
    error,
    reload: loadTips,
  };
}

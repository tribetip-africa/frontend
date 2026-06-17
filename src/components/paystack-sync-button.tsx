"use client";

import { useState } from "react";
import { repairPaystackData } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import type { PaystackRepairResult } from "@/types/api";
import { Button } from "@/components/ui/button";

type PaystackSyncButtonProps = {
  token: string;
  variant?: "primary" | "secondary" | "ghost";
  label?: string;
  syncingLabel?: string;
  onRepaired?: (result: PaystackRepairResult) => void;
  onError?: (message: string) => void;
};

export function PaystackSyncButton({
  token,
  variant = "secondary",
  label = "Sync with Paystack",
  syncingLabel = "Syncing…",
  onRepaired,
  onError,
}: PaystackSyncButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);

    try {
      const payload = await repairPaystackData(token);
      onRepaired?.(payload.repair);
    } catch (err) {
      onError?.(getDisplayMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant={variant} disabled={loading} onClick={() => void handleSync()}>
      {loading ? syncingLabel : label}
    </Button>
  );
}

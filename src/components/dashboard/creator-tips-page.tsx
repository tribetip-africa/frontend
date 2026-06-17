"use client";

import { useCallback, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PayoutSyncRepairPanel } from "@/components/payout-sync-repair-panel";
import { TipsList } from "@/components/tips-list";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/dashboard-context";
import { fetchMyTips } from "@/lib/api";
import { getDisplayMessage } from "@/lib/errors";
import { buildSupporterExportCsv, downloadCsvFile } from "@/lib/supporter-export";

export function CreatorTipsPage() {
  const { token, tribe } = useDashboard();
  const [tipsRefreshSignal, setTipsRefreshSignal] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleRepairComplete = useCallback(() => {
    setTipsRefreshSignal((current) => current + 1);
  }, []);

  async function handleExportSupporters() {
    setExporting(true);
    setExportError(null);

    try {
      const tips = await fetchMyTips(token);
      downloadCsvFile(`${tribe.username}-supporters.csv`, buildSupporterExportCsv(tips));
    } catch (err) {
      setExportError(getDisplayMessage(err));
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <DashboardPageHeader
        title="Tips & earnings"
        description="Recent supporter payments and their status."
        action={
          <Button
            type="button"
            variant="secondary"
            disabled={exporting}
            onClick={() => void handleExportSupporters()}
          >
            {exporting ? "Preparing export…" : "Export supporters (CSV)"}
          </Button>
        }
      />

      {exportError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {exportError}
        </p>
      )}

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <PayoutSyncRepairPanel token={token} onRepaired={handleRepairComplete} />
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <TipsList token={token} refreshSignal={tipsRefreshSignal} />
      </div>
    </>
  );
}
